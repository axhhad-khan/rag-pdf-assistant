from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_size: int
    status: DocumentStatus
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
    chunk_count: int = 0


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
