"""
Database engine + session management.

INPUT:   DATABASE_URL from settings
PROCESS: Create a SQLAlchemy engine and a session factory
OUTPUT:  get_db() — a FastAPI dependency that yields a DB session
         and always closes it, even if the request raises an error.

CLOUD DB CONNECTION DROPS
--------------------------
Managed Postgres providers (Neon, Supabase, RDS, etc.) silently close
idle connections after a timeout, often shorter than you'd expect —
sometimes just a few minutes. A connection that sits open and unused
while your app does CPU-bound work (like generating embeddings for a
large PDF) is exactly the kind of connection that gets dropped.

Two engine settings defend against this:

- pool_pre_ping=True   Before handing out a pooled connection, SQLAlchemy
                        runs a cheap "SELECT 1" against it. If that fails
                        (because the server already closed it), SQLAlchemy
                        transparently discards it and opens a fresh one —
                        your code never sees the stale connection.

- pool_recycle=1800     Proactively throws away and reopens any pooled
                        connection older than this many seconds (here: 30
                        minutes), *before* the cloud provider's own idle
                        timeout has a chance to kill it from the server
                        side. Set this comfortably below your provider's
                        documented idle/connection timeout.

connect_args below also enables TCP keepalives at the psycopg2 level, so
idle-but-still-open connections send periodic probes that can prevent
some intermediate proxies/load balancers from silently dropping them.

Neither setting protects a connection that is held open *during* a
long-running Python computation with no queries — that's a usage
pattern problem, not a pool-config problem. See ingestion_service.py
for how we avoid holding a session open across the slow parts of PDF
processing.
"""

from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,   # validate connections before use; silently replace dead ones
    pool_recycle=1800,    # recycle connections older than 30 min, before the provider does
    pool_size=5,
    max_overflow=10,
    connect_args={
        # psycopg2 / libpq TCP keepalive settings — helps detect and
        # avoid half-dead connections on cloud networks.
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    },
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — one session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def session_scope():
    """
    A short-lived session for use OUTSIDE FastAPI's request lifecycle —
    e.g. inside a long-running processing function that should only hold
    a DB connection open for the brief moments it's actually querying,
    not for the entire duration of CPU-bound work in between.

    Commits on success, rolls back and re-raises on any exception, and
    always closes the session/connection afterward.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
