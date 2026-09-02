"""
Chunking Service
----------------
INPUT:   list of {"page_number": int, "text": str} from pdf_service
PROCESS: split each page's text into overlapping word-based windows
OUTPUT:  list of {"page_number": int, "chunk_text": str}

WHY CHUNKING IS NECESSARY
--------------------------
1. Embedding models and LLMs have a limited context window — you can't
   embed or feed an entire 40-page PDF as one block of text.
2. Retrieval precision: if a document is one giant chunk, a similarity
   search can only ever retrieve "the whole document", which defeats the
   purpose of RAG (finding the *specific* passage that answers a question).
3. Smaller, focused chunks produce embeddings that represent one coherent
   idea, so cosine similarity against a question is much more meaningful.

WHY OVERLAP
-----------
Splitting text into non-overlapping blocks risks cutting a sentence or
idea exactly at a chunk boundary, so the answer ends up split across two
chunks and neither one alone is a good match for the question. A small
overlap (e.g. 100 words) means the end of one chunk is repeated at the
start of the next, so an idea near a boundary still appears whole in at
least one chunk.
"""

from app.config import settings


def chunk_text(text: str, chunk_size: int | None = None, overlap: int | None = None) -> list[str]:
    """Word-based sliding-window chunking of a single string."""
    chunk_size = chunk_size or settings.chunk_size_words
    overlap = overlap or settings.chunk_overlap_words

    words = text.split()
    if not words:
        return []

    chunks = []
    step = max(chunk_size - overlap, 1)  # guard against overlap >= chunk_size
    for start in range(0, len(words), step):
        window = words[start : start + chunk_size]
        if not window:
            break
        chunks.append(" ".join(window))
        if start + chunk_size >= len(words):
            break

    return chunks


def chunk_pages(pages: list[dict]) -> list[dict]:
    """
    Takes pdf_service's page list and returns flat chunk records:
    [{"page_number": 1, "chunk_text": "..."}, {"page_number": 1, "chunk_text": "..."}, ...]

    Chunking is done per-page (not across page boundaries) so that every
    chunk keeps a single, unambiguous page_number for citation purposes.
    """
    records = []
    for page in pages:
        for piece in chunk_text(page["text"]):
            records.append({"page_number": page["page_number"], "chunk_text": piece})
    return records
