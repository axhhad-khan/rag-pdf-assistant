"""
Auth Service
------------
INPUT:   a plaintext password (to hash or verify), or a user id (to encode a token)
PROCESS: bcrypt hashing/verification (via the `bcrypt` library directly); JWT
         encode/decode using JWT_SECRET
OUTPUT:  a password hash, a boolean match result, or a signed JWT / decoded payload

WHY NOT passlib?
-----------------
passlib (last released 2020) is unmaintained and its bcrypt backend does two
things that break on modern bcrypt (4.x):
  1. It reads `bcrypt.__about__.__version__` to detect the installed version —
     that submodule was removed in bcrypt 4.x, causing
     `AttributeError: module 'bcrypt' has no attribute '__about__'`.
  2. Its own internal self-test (`detect_wrap_bug`) hashes a hardcoded probe
     string to check for a legacy bcrypt bug. Modern bcrypt raises
     `ValueError: password cannot be longer than 72 bytes` on that internal
     probe instead of silently truncating like old bcrypt did — so passlib's
     own startup check crashes before your request's password is even
     touched.
Calling the `bcrypt` package directly (as below) sidesteps both problems
entirely — no version-string sniffing, no internal legacy-bug probing.

72-BYTE LIMIT
--------------
bcrypt still hard-caps input at 72 bytes. We rely on the Pydantic
field_validator in app/schemas/auth.py (on both RegisterRequest and
LoginRequest) to reject over-length passwords with a clean 422 error before
they ever reach hash_password()/verify_password() here.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError

from app.config import settings


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    """Returns the user_id encoded in the token, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        return int(user_id) if user_id is not None else None
    except (JWTError, ValueError):
        return None