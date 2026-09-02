"""
Retrieval Service
------------------
INPUT:   a user's question (string) + their user_id
PROCESS:
    1. Embed the question with the same model used for chunks
    2. Search pgvector for the closest chunk embeddings using cosine
       distance, filtered to WHERE user_id = <the authenticated user>
    3. Convert distance -> similarity and keep only chunks above a
       minimum relevance threshold
OUTPUT:  Top-K relevant chunks (with document filename + page number),
         ready to be handed to the LLM service as context.

USER ISOLATION (read this twice)
---------------------------------
The SQL query below always includes `DocumentChunk.user_id == user_id`.
This is not optional and not a performance nicety — it is the entire
security boundary that stops User A's question from ever retrieving
User B's document chunks. Every retrieval call in this codebase must
go through this function so that boundary can never be forgotten.
"""

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.config import settings
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.services.embedding_service import embed_text


@dataclass
class RetrievedChunk:
    chunk_id: int
    document_id: int
    filename: str
    page_number: int
    chunk_text: str
    similarity: float


def retrieve_relevant_chunks(db: Session, user_id: int, question: str, top_k: int | None = None) -> list[RetrievedChunk]:
    top_k = top_k or settings.top_k

    question_embedding = embed_text(question)

    # cosine_distance ranges 0 (identical) .. 2 (opposite); since our
    # embeddings are normalized, similarity = 1 - cosine_distance.
    distance_expr = DocumentChunk.embedding.cosine_distance(question_embedding)

    results = (
        db.query(
            DocumentChunk.id,
            DocumentChunk.document_id,
            DocumentChunk.page_number,
            DocumentChunk.chunk_text,
            Document.filename,
            distance_expr.label("distance"),
        )
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(DocumentChunk.user_id == user_id)  # <-- the user-isolation boundary
        .order_by(distance_expr.asc())
        .limit(top_k)
        .all()
    )

    chunks = []
    for row in results:
        similarity = 1 - float(row.distance)
        if similarity >= settings.similarity_threshold:
            chunks.append(
                RetrievedChunk(
                    chunk_id=row.id,
                    document_id=row.document_id,
                    filename=row.filename,
                    page_number=row.page_number,
                    chunk_text=row.chunk_text,
                    similarity=round(similarity, 4),
                )
            )
    return chunks
