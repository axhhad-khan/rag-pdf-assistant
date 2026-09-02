"""
Embedding Service
-----------------
INPUT:   one string, or a list of strings (chunk text / a user question)
PROCESS: run them through a Sentence-Transformers model (all-MiniLM-L6-v2)
         which maps text to a fixed-size numerical vector such that
         semantically similar text ends up close together in vector space
OUTPUT:  a 384-dimensional embedding (or list of them)

Example (conceptual):
    "Machine learning is a subset of AI"  ->  [0.023, -0.182, 0.421, ...]

The model is loaded once at import time (it's a few hundred MB) and
reused for every request — loading it per-request would be far too slow.

IMPORTANT: settings.embedding_dim must match this model's actual output
dimension (384 for all-MiniLM-L6-v2), because that's the size of the
pgvector column the embeddings are stored in.
"""

from sentence_transformers import SentenceTransformer

from app.config import settings

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed_text(text: str) -> list[float]:
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, batch_size=32, show_progress_bar=False)
    return vectors.tolist()
