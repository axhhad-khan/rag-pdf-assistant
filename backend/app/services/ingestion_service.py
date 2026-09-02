"""
Ingestion Service
------------------
Orchestrates the full pipeline for one uploaded PDF:

    PDF file on disk
      -> pdf_service.extract_pages()       (PDF -> pages of text)
      -> chunking_service.chunk_pages()    (pages -> overlapping chunks)
      -> embedding_service.embed_texts()   (chunks -> vectors)
      -> DocumentChunk rows in Postgres    (vectors -> pgvector)

CONNECTION-SAFETY DESIGN
--------------------------
For a large PDF, extraction + chunking + embedding generation is
CPU-bound and can take a long time. If we held one SQLAlchemy Session
open for that entire duration, the underlying DB connection would sit
idle and is very likely to be dropped by a managed/cloud Postgres
provider before we get to write the results — which is exactly the
`SSL connection has been closed unexpectedly` error.

So this function is split into two DB-touching phases, with no
open session in between:

  Phase A (short DB session): fetch just the fields we need
  Phase B (no DB session):    do all the slow CPU work in plain Python
  Phase C (short DB session): write the results, with rollback-and-retry
                               on transient connection errors

`process_document` therefore takes plain values (document_id, user_id,
file_path) rather than a live ORM object bound to a caller's session —
that live object would become invalid/detached once its owning
session, closes, and reusing a *caller-supplied* session across a long
computation is exactly the anti-pattern we're avoiding.
"""

import time

from sqlalchemy.exc import OperationalError, PendingRollbackError
from sqlalchemy.orm import Session

from app.database.database import session_scope
from app.models.chunk import DocumentChunk
from app.models.document import Document, DocumentStatus
from app.services.chunking_service import chunk_pages
from app.services.embedding_service import embed_texts
from app.services.pdf_service import extract_pages, PDFExtractionError

MAX_COMMIT_RETRIES = 3
RETRY_BACKOFF_SECONDS = 2


def _mark_status(document_id: int, status: DocumentStatus, error_message: str | None = None) -> None:
    """
    Opens its own short-lived session just to update status — never
    reuses a session that may have already failed/rolled back.
    Retries a couple of times on transient connection errors, since
    this status write matters (it's how the user finds out processing
    failed) and a single dropped connection shouldn't lose that.
    """
    last_error = None
    for attempt in range(1, MAX_COMMIT_RETRIES + 1):
        try:
            with session_scope() as db:
                document = db.query(Document).filter(Document.id == document_id).first()
                if document is None:
                    return  # document was deleted mid-processing; nothing to update
                document.status = status
                document.error_message = error_message
            return  # session_scope() committed successfully
        except (OperationalError, PendingRollbackError) as exc:
            # session_scope() already rolled back internally on the way out.
            last_error = exc
            if attempt < MAX_COMMIT_RETRIES:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)  # simple linear backoff
    # If we get here, every retry failed — log it. Don't crash the
    # background pipeline over a status-write failure; the document
    # will just be left in "processing" for the user to see and retry.
    print(f"[ingestion] Failed to update status for document {document_id} after retries: {last_error}")


def process_document(document_id: int, user_id: int, file_path: str) -> None:
    # --- Phase A + B: no long-lived session; all CPU work happens with
    #     zero open DB connections ---
    try:
        pages = extract_pages(file_path)
        chunk_records = chunk_pages(pages)

        if not chunk_records:
            raise PDFExtractionError("No text could be chunked from this PDF.")

        texts = [c["chunk_text"] for c in chunk_records]
        embeddings = embed_texts(texts)  # the slow part — no DB session open here

    except PDFExtractionError as exc:
        _mark_status(document_id, DocumentStatus.failed, str(exc))
        return
    except Exception as exc:  # noqa: BLE001 — capture any unexpected failure here too
        _mark_status(document_id, DocumentStatus.failed, f"Unexpected error during processing: {exc}")
        return

    # --- Phase C: a short session just to write the results ---
    last_error = None
    for attempt in range(1, MAX_COMMIT_RETRIES + 1):
        try:
            with session_scope() as db:
                document = db.query(Document).filter(Document.id == document_id).first()
                if document is None:
                    return  # deleted mid-processing

                for record, embedding in zip(chunk_records, embeddings):
                    db.add(
                        DocumentChunk(
                            document_id=document_id,
                            user_id=user_id,
                            page_number=record["page_number"],
                            chunk_text=record["chunk_text"],
                            embedding=embedding,
                        )
                    )
                document.status = DocumentStatus.completed
                document.error_message = None
            return  # session_scope() committed successfully
        except (OperationalError, PendingRollbackError) as exc:
            # session_scope()'s own except block already called db.rollback()
            # before propagating — that's what makes it safe to just retry
            # with a brand-new session/connection here, instead of reusing
            # a session that's now in a poisoned state.
            last_error = exc
            if attempt < MAX_COMMIT_RETRIES:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)

    # All retries exhausted — record the failure with its own fresh session.
    _mark_status(document_id, DocumentStatus.failed, f"Database error while saving results: {last_error}")
