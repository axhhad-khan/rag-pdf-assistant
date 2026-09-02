"""
Central configuration for the application.

Every secret / environment-specific value is read from environment
variables (via a local .env file, or real env vars in production).
Nothing here is ever hardcoded — see .env.example for the full list.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Database ---
    database_url: str = "postgresql://postgres:postgres@localhost:5432/rag_pdf_assistant"

    # --- Auth / JWT ---
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # --- AI / RAG ---
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dim: int = 384  # all-MiniLM-L6-v2 output size — must match the pgvector column
    llm_model: str = "gemini-3.6-flash"
    gemini_api_key: str = ""

    # --- Chunking ---
    chunk_size_words: int = 600
    chunk_overlap_words: int = 100

    # --- Retrieval ---
    top_k: int = 5
    similarity_threshold: float = 0.25  # below this, we say "not found in your documents"

    # --- Uploads ---
    max_upload_size_mb: int = 20
    upload_dir: str = "./uploaded_files"

    # --- CORS ---
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
