from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.config import settings
from app.database.database import Base


class DocumentChunk(Base):
    """
    One chunk of text from a document, plus its embedding vector.

    This is the core unit RAG retrieval searches over. Every chunk
    carries user_id directly (denormalized from the parent document)
    so that every similarity-search query can filter WHERE user_id = ?
    without an extra join — this is what makes cross-user data leakage
    structurally hard to get wrong.
    """

    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(settings.embedding_dim), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="chunks")
