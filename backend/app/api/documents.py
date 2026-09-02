import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.chunk import DocumentChunk
from app.models.document import Document, DocumentStatus
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.services.ingestion_service import process_document

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_CONTENT_TYPES = {"application/pdf"}


def _with_chunk_count(db: Session, document: Document) -> DocumentResponse:
    count = db.query(func.count(DocumentChunk.id)).filter(DocumentChunk.document_id == document.id).scalar()
    data = DocumentResponse.model_validate(document)
    data.chunk_count = count or 0
    return data


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Verify file type
    if file.content_type not in ALLOWED_CONTENT_TYPES and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported.")

    # 2. Read + verify file size
    contents = file.file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.max_upload_size_mb}MB limit.",
        )

    # 3. Save to disk under a unique, non-guessable name
    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}.pdf"
    file_path = os.path.join(settings.upload_dir, stored_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    # 4. Create the Document row (status=processing)
    document = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=len(contents),
        status=DocumentStatus.processing,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # 5. Run the ingestion pipeline (extract -> chunk -> embed -> store)
    #    Kept synchronous in V1 for simplicity — see README for the
    #    background-task-queue upgrade path.
    #
    #    We pass plain values, not the `document` ORM object — process_document
    #    opens its own short-lived sessions internally rather than reusing this
    #    request's session across the slow PDF/embedding work (see
    #    ingestion_service.py's module docstring for why).
    process_document(document.id, current_user.id, file_path)
    db.refresh(document)

    return _with_chunk_count(db, document)


@router.get("/", response_model=DocumentListResponse)
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)  # user isolation
        .order_by(Document.created_at.desc())
        .all()
    )
    return DocumentListResponse(
        documents=[_with_chunk_count(db, d) for d in documents],
        total=len(documents),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)  # user isolation
        .first()
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return _with_chunk_count(db, document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)  # user isolation
        .first()
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Remove the file from disk too, not just the DB row.
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)  # cascades to document_chunks
    db.commit()
    return None
