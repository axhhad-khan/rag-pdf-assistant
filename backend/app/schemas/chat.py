from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SourceItem(BaseModel):
    document: str
    page: int
    document_id: int
    similarity: float


class ChatRequest(BaseModel):
    conversation_id: int | None = None  # None -> a new conversation is created
    question: str


class ChatResponse(BaseModel):
    conversation_id: int
    answer: str
    sources: list[SourceItem]


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str
    sources: list[dict] | None = None
    created_at: datetime


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse]
