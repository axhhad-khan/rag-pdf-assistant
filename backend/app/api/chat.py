from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies.auth import get_current_user
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.message import Message, MessageRole
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    SourceItem,
    ConversationResponse,
    ConversationDetailResponse,
)
from app.services.llm_service import generate_answer
from app.services.retrieval_service import retrieve_relevant_chunks

router = APIRouter(tags=["chat"])


def _get_owned_conversation(db: Session, conversation_id: int, user_id: int) -> Conversation:
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)  # user isolation
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return conversation


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty.")

    # Reuse an existing conversation (verifying ownership) or create a new one
    if payload.conversation_id is not None:
        conversation = _get_owned_conversation(db, payload.conversation_id, current_user.id)
    else:
        conversation = Conversation(user_id=current_user.id, title=payload.question[:80])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Guard: does this user even have any completed documents?
    has_documents = db.query(Document).filter(Document.user_id == current_user.id).first()
    if not has_documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload at least one document before starting a chat.",
        )

    # --- Core RAG pipeline ---
    # question -> question embedding -> pgvector search (user-scoped) -> top-K chunks
    chunks = retrieve_relevant_chunks(db, user_id=current_user.id, question=payload.question)
    # question + retrieved context -> LLM -> answer
    try:
        answer = generate_answer(payload.question, chunks)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LLM generation failed: {exc}") from exc

    sources = [
        SourceItem(document=c.filename, page=c.page_number, document_id=c.document_id, similarity=c.similarity)
        for c in chunks
    ]

    # Persist both turns of the conversation
    db.add(Message(conversation_id=conversation.id, role=MessageRole.user, content=payload.question))
    db.add(
        Message(
            conversation_id=conversation.id,
            role=MessageRole.assistant,
            content=answer,
            sources=[s.model_dump() for s in sources],
        )
    )
    db.commit()

    return ChatResponse(conversation_id=conversation.id, answer=answer, sources=sources)


@router.get("/chat/conversations", response_model=list[ConversationResponse])
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)  # user isolation
        .order_by(Conversation.updated_at.desc())
        .all()
    )


@router.get("/chat/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(conversation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = _get_owned_conversation(db, conversation_id, current_user.id)
    return conversation


@router.delete("/chat/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = _get_owned_conversation(db, conversation_id, current_user.id)
    db.delete(conversation)  # cascades to messages
    db.commit()
    return None
