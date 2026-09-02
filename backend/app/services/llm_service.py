"""
LLM Service
-----------
INPUT:   the user's question + the chunks retrieved by retrieval_service
PROCESS: build a strict, context-only prompt and send it to Gemini via
         the `google-genai` SDK (model configurable through LLM_MODEL /
         GEMINI_API_KEY)
OUTPUT:  a final natural-language answer string

WHY `google-genai` AND NOT `google-generativeai`?
---------------------------------------------------
`google-generativeai` (the package this project originally used) is
fully deprecated — Google has replaced it with a single unified SDK,
`google-genai`, and the old package receives no further updates or bug
fixes. On top of that, Gemini 1.0/1.5 models (including
`gemini-1.5-flash`, this project's original default) have been fully
retired and now return 404 on every request, regardless of which SDK
you call them with. Both had to change together: the SDK, and the
model name (now `gemini-2.5-flash` by default via LLM_MODEL).

NO-HALLUCINATION RULE
----------------------
If retrieval_service returns no chunks above the similarity threshold,
we NEVER call the LLM at all — we return the "not found" message
directly. This guarantees the assistant can't invent an answer (or
fake sources) when nothing relevant was actually retrieved.
"""

from google import genai
from google.genai import types

from app.config import settings
from app.services.retrieval_service import RetrievedChunk

NOT_FOUND_MESSAGE = "I couldn't find this information in your uploaded documents."

SYSTEM_PROMPT = """You are a document question-answering assistant.

Answer the user's question using ONLY the provided context below.
If the answer cannot be found in the context, say exactly:
"I couldn't find this information in your uploaded documents."

Do not invent information. Do not use outside knowledge.
+
+Formatting rules:
Write in clean Markdown: use **bold** for key terms, and bullet or
numbered lists when listing multiple points — don't run everything
into one dense paragraph.
Do NOT include inline citations like "[Source 1]" or "(Source 2, page 4)"
in your answer text. The application already displays the source
documents and page numbers separately below your answer, so repeating
them inline is redundant — just write the answer itself."""

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def build_context(chunks: list[RetrievedChunk]) -> str:
    parts = []
    for i, c in enumerate(chunks, start=1):
        parts.append(f"[Source {i}: {c.filename}, page {c.page_number}]\n{c.chunk_text}")
    return "\n\n".join(parts)


def generate_answer(question: str, chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return NOT_FOUND_MESSAGE

    context = build_context(chunks)
    user_prompt = f"CONTEXT:\n{context}\n\nQUESTION:\n{question}"

    client = _get_client()
    response = client.models.generate_content(
        model=settings.llm_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,
            max_output_tokens=800,
        ),
    )
    return response.text.strip()