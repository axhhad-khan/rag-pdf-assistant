"""
get_current_user — the single FastAPI dependency every protected route uses.

INPUT:   Authorization: Bearer <token> header
PROCESS: decode the JWT, look up the user_id it encodes, fetch that user
OUTPUT:  the authenticated User row (or a 401 error)

Every route in api/documents.py and api/chat.py depends on this, which
is what guarantees "protected routes require authentication" and gives
every downstream query the current_user.id needed for user isolation.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.auth_service import decode_access_token

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_error

    return user
