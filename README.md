# DocuChat — AI PDF Chat Assistant (RAG, built from scratch)

A multi-user SaaS application where users upload PDF documents and ask
questions about them in plain language. The system retrieves the exact
passages relevant to the question and generates an answer grounded in
those passages — with page-level source citations.

This project implements **Retrieval-Augmented Generation (RAG) manually**,
without LangChain or LlamaIndex, so every step of the pipeline is visible
and understandable in plain Python.

```
USER
 ↓
AUTHENTICATION (JWT)
 ↓
UPLOAD PDF
 ↓
TEXT EXTRACTION (PyMuPDF)
 ↓
CHUNKING (custom, overlapping windows)
 ↓
EMBEDDING (Sentence-Transformers)
 ↓
POSTGRESQL + PGVECTOR (vector storage)
 ↓
QUESTION
 ↓
QUESTION EMBEDDING
 ↓
SIMILARITY SEARCH (cosine distance, scoped to the user)
 ↓
TOP-K CHUNKS
 ↓
CONTEXT
 ↓
LLM (OpenAI)
 ↓
ANSWER + SOURCES
```

---

## Table of contents

- [Quick start](#quick-start)
- [Concepts explained](#concepts-explained)
- [Architecture](#architecture)
- [How each pipeline stage works](#how-each-pipeline-stage-works)
- [Authentication & user isolation](#authentication--user-isolation)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Testing](#testing)
- [How LangChain/LlamaIndex could simplify this](#how-langchainllamaindex-could-simplify-this)
- [Roadmap / production upgrade path](#roadmap--production-upgrade-path)

---

## Quick start

This project runs entirely on your local machine — no Docker required.
You need three things running: PostgreSQL (with pgvector), the FastAPI
backend, and the React frontend. See
[Local setup — step by step](#local-setup--step-by-step) below for the
full walkthrough. In short:

```bash
# 1. Start local PostgreSQL (with pgvector) — see setup section below
# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # edit .env — set GEMINI_API_KEY and a strong JWT_SECRET
uvicorn app.main:app --reload

# 3. Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Then open the app:
- Frontend: http://localhost:5173
- Backend API docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

---

## Concepts explained

**What is RAG (Retrieval-Augmented Generation)?**
A technique where, instead of asking an LLM a question directly (and
hoping it "knows" the answer from training data), you first *retrieve*
the most relevant pieces of your own data, then hand the LLM the
question **plus** that retrieved context, and ask it to answer using
only that context. This grounds answers in real, private data the
model was never trained on.

**Why do we need embeddings?**
An embedding is a way of converting text into a list of numbers (a
vector) such that texts with similar *meaning* end up close together
in that numeric space — even if they don't share the same words.
That's what lets us search by meaning instead of exact keyword match.

**What is a vector?**
Just a fixed-length list of numbers, e.g. `[0.023, -0.182, 0.421, ...]`.
Our embedding model (`all-MiniLM-L6-v2`) outputs 384-dimensional vectors.

**What is a vector database?**
A database (or database extension) optimized for storing vectors and
answering "which stored vectors are closest to this query vector?"
efficiently, instead of comparing against every row with a linear scan.

**What is pgvector?**
A PostgreSQL extension that adds a native `vector` column type and
distance operators (cosine, L2, inner product) directly inside
Postgres. This means we get vector search *and* normal relational
data (users, documents, foreign keys) in a single database — no
separate vector database service to run and keep in sync.

**What is cosine similarity?**
A measure of how similar two vectors' *directions* are, ignoring their
magnitude. It ranges from -1 (opposite) to 1 (identical direction).
pgvector exposes cosine **distance** (`<=>`), so we convert:
`similarity = 1 - cosine_distance`.

**What is Top-K retrieval?**
Instead of retrieving every chunk above some threshold, we retrieve
the K closest chunks (K=5 by default) — a simple, predictable way to
bound how much context gets sent to the LLM.

---

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────────┐
│   React     │ HTTP │   FastAPI    │      │   PostgreSQL         │
│   Frontend  │◄────►│   Backend    │◄────►│   + pgvector         │
│  (Vite)     │ JWT  │              │      │  users, documents,   │
└─────────────┘      └──────┬───────┘      │  document_chunks,    │
                             │              │  conversations,      │
                             ▼              │  messages             │
                      ┌─────────────┐       └─────────────────────┘
                      │  OpenAI API  │
                      │  (generation)│
                      └─────────────┘
```

- **Frontend**: React + Vite + Tailwind. Talks to the backend only via
  its REST API, with the JWT attached on every request.
- **Backend**: FastAPI. Owns all business logic — auth, ingestion,
  retrieval, generation.
- **Database**: PostgreSQL with the `vector` extension enabled. Stores
  both relational data and embeddings side by side.

---

## How each pipeline stage works

Each service in `backend/app/services/` documents itself with an
INPUT → PROCESS → OUTPUT docstring. Summary:

### PDF ingestion (`pdf_service.py`)
- **INPUT**: path to an uploaded PDF file
- **PROCESS**: PyMuPDF opens the file, walks every page, extracts raw
  text, cleans whitespace, and skips pages with no extractable text
- **OUTPUT**: `[{"page_number": 1, "text": "..."}, ...]`

### Chunking (`chunking_service.py`)
- **INPUT**: the page list above
- **PROCESS**: splits each page's text into overlapping word windows
  (default: 600 words per chunk, 100-word overlap)
- **OUTPUT**: `[{"page_number": 1, "chunk_text": "..."}, ...]`

Why chunk at all? Embedding models and LLMs have limited context
windows, and retrieval is only useful if it can point to a *specific*
passage rather than "the whole document." Why overlap? So an idea
that falls near a chunk boundary still appears whole in at least one
chunk, instead of being split across two chunks that individually look
like weak matches.

### Embedding (`embedding_service.py`)
- **INPUT**: chunk text (or a user's question)
- **PROCESS**: Sentence-Transformers (`all-MiniLM-L6-v2`) converts text
  into a 384-dimensional vector
- **OUTPUT**: `[0.023, -0.182, 0.421, ...]`

### Storage (pgvector)
Each chunk is stored as a row in `document_chunks` with its embedding
in a native `vector(384)` column, alongside `document_id`, `user_id`,
and `page_number` — everything needed to answer "where did this text
come from?" later.

### Retrieval (`retrieval_service.py`)
- **INPUT**: a user's question + their `user_id`
- **PROCESS**:
  1. Embed the question with the same model used for chunks
  2. Query pgvector for the closest chunks by cosine distance
  3. **Filter to `WHERE user_id = <authenticated user>`** — always
  4. Convert distance to similarity, drop anything below the
     relevance threshold
  5. Keep the Top-K closest chunks
- **OUTPUT**: a ranked list of relevant chunks with filename + page

### Generation (`llm_service.py`)
- **INPUT**: the question + retrieved chunks
- **PROCESS**: builds a prompt that instructs the LLM to answer *only*
  from the given context, and to say the information wasn't found if
  it isn't there. If no chunks were retrieved, the LLM is never even
  called — the "not found" message is returned directly. This is what
  prevents hallucinated answers and fabricated sources.
- **OUTPUT**: a final answer string

---

## Authentication & user isolation

- Passwords are hashed with bcrypt — never stored in plaintext.
- Login issues a JWT (24h expiry by default) signed with `JWT_SECRET`.
- Every protected route depends on `get_current_user`, which decodes
  the JWT and loads the corresponding user — one single dependency
  used everywhere, so there's only one place authentication logic can
  go wrong.
- **Every** query for documents, chunks, and conversations includes a
  `WHERE user_id = <current user>` filter. In particular, the vector
  similarity search in `retrieval_service.py` filters by `user_id`
  *before* ranking by distance — so User A's question can structurally
  never retrieve User B's chunks, no matter how similar the content is.

---

## API reference

```
/auth
    POST /register          — create an account, returns a JWT
    POST /login              — returns a JWT
    GET  /me                 — current user's profile (protected)

/documents
    POST   /upload            — upload a PDF, runs the full ingestion pipeline
    GET    /                  — list your documents
    GET    /{id}               — get one document
    DELETE /{id}               — delete a document (and its chunks)

/chat
    POST   /chat                          — ask a question (creates a conversation if needed)
    GET    /chat/conversations             — list your conversations
    GET    /chat/conversations/{id}        — get one conversation with its messages
    DELETE /chat/conversations/{id}        — delete a conversation

/health
    GET /                     — liveness check
```

Full interactive docs are always available at `/docs` (Swagger UI).

---

## Project structure

```
rag-pdf-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, startup, CORS, error handler
│   │   ├── config.py                # all settings, read from env vars
│   │   ├── api/                     # route handlers (auth, documents, chat)
│   │   ├── models/                  # SQLAlchemy models (User, Document, DocumentChunk, ...)
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── services/                # the actual RAG pipeline logic
│   │   ├── database/                # engine + session
│   │   └── dependencies/            # auth dependency
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Landing, Login, Register, Dashboard, Documents, Chat, Settings
│   │   ├── components/              # DashboardLayout, ProtectedRoute
│   │   ├── services/                # axios API client
│   │   ├── hooks/                   # useAuth
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## Local setup — step by step

The app has three moving parts you run yourself, in three terminals:
**PostgreSQL (with pgvector)**, the **FastAPI backend**, and the
**React frontend**.

### 1. Install prerequisites

- **Python 3.11+**
- **Node.js 20+** and npm
- **PostgreSQL 16+** — install locally:
  - macOS: `brew install postgresql@16`
  - Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
  - Windows: install via the [official installer](https://www.postgresql.org/download/windows/)
- **pgvector extension** for your PostgreSQL install:
  - macOS (Homebrew): `brew install pgvector`
  - Ubuntu/Debian:
    ```bash
    sudo apt install postgresql-16-pgvector
    ```
    (or build from source — see the [pgvector README](https://github.com/pgvector/pgvector) if your distro doesn't package it)
  - Windows: follow the ["Windows" build instructions](https://github.com/pgvector/pgvector#windows) in the pgvector repo

### 2. Start PostgreSQL and create the database

Make sure the PostgreSQL service is running:

```bash
# macOS (Homebrew)
brew services start postgresql@16

# Ubuntu/Debian
sudo service postgresql start

# Windows — the installer sets this up as a Windows service that
# starts automatically; check via Services if unsure.
```

Create the database (adjust the username if you're not using the
default `postgres` superuser):

```bash
psql -U postgres -c "CREATE DATABASE rag_pdf_assistant;"
```

You do **not** need to manually run `CREATE EXTENSION vector` — the
backend does this automatically on startup (see `main.py`'s startup
event). If you'd rather do it yourself:

```bash
psql -U postgres -d rag_pdf_assistant -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit backend/.env:
#   - DATABASE_URL should already point at localhost:5432 — update the
#     username/password if your local Postgres uses different ones
#   - JWT_SECRET: generate with `python -c "import secrets; print(secrets.token_hex(32))"`
#   - GEMINI_API_KEY: your Google AI Studio API key

uvicorn app.main:app --reload
```

The backend starts on **http://localhost:8000**. On first startup it
creates the `vector` extension and all tables automatically. Uploaded
PDFs are saved under `backend/uploaded_files/` (created automatically,
already git-ignored).

Visit **http://localhost:8000/docs** to confirm it's running.

### 4. Frontend setup

In a second terminal:

```bash
cd frontend
npm install

cp .env.example .env.local
# Edit frontend/.env.local if your backend isn't on the default
# http://localhost:8000

npm run dev
```

The frontend starts on **http://localhost:5173**.

### 5. You're running locally

- Frontend: http://localhost:5173
- Backend + Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
- Database: `localhost:5432/rag_pdf_assistant`

To stop everything, `Ctrl+C` in both terminals (and stop the Postgres
service if you want to fully shut it down).

---

## Testing

Create a separate local test database (once):

```bash
psql -U postgres -c "CREATE DATABASE rag_pdf_assistant_test;"
```

Then run the suite:

```bash
cd backend
source venv/bin/activate   # if not already active
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag_pdf_assistant_test
pytest -v
```

Tests require a real local Postgres instance with pgvector available
(SQLite has no vector type) — point `TEST_DATABASE_URL` at the test
database you just created; the extension is created automatically by
the test fixtures.

Coverage includes:
- **Auth**: register, duplicate email rejection, login, wrong password, protected routes
- **Documents**: upload, non-PDF rejection, empty-file rejection, list (own only), delete
- **RAG**: chunk overlap correctness, page-number preservation, embedding dimension,
  semantic similarity sanity check, and a **user-isolation** test

---

## How LangChain/LlamaIndex could simplify this

This project deliberately avoids LangChain/LlamaIndex so every step is
visible. If you later want to adopt one of them, here's what they'd
replace:

| Manual code here | LangChain/LlamaIndex equivalent |
|---|---|
| `pdf_service.py` + `chunking_service.py` | `PyPDFLoader` + `RecursiveCharacterTextSplitter` (LangChain) or `SimpleDirectoryReader` + `SentenceSplitter` (LlamaIndex) |
| `embedding_service.py` | `HuggingFaceEmbeddings` / `OpenAIEmbeddings` wrapper classes |
| Manual pgvector inserts | `PGVector` vector store class with a `.add_documents()` method |
| `retrieval_service.py`'s cosine-distance query | `vectorstore.as_retriever(search_kwargs={"k": 5, "filter": {"user_id": ...}})` |
| `llm_service.py`'s manual prompt + call | A `RetrievalQA` chain or `ConversationalRetrievalChain` |

The trade-off: these libraries remove boilerplate and add features
(re-ranking, multi-query retrieval, agents) very quickly, but they also
hide exactly the mechanics this project was built to teach — how a
question actually becomes an embedding, how that embedding is compared
against stored vectors, and how the winning chunks become an LLM
prompt. Once you're comfortable with the manual version, switching is
mostly swapping a few files, not restructuring the pipeline.

---

## Roadmap / production upgrade path

V1 is intentionally simple. Natural next steps for a real production
deployment:
- Move PDF ingestion (`process_document`) into a background task queue
  (Celery, RQ, or FastAPI `BackgroundTasks`) so uploads don't block the
  request while embeddings are generated.
- Add refresh tokens / token revocation instead of a single long-lived JWT.
- Add pagination to document/conversation lists.
- Add OCR (e.g. Tesseract) for scanned PDFs with no extractable text layer.
- Add a proper vector index (`ivfflat` or `hnsw`) on the `embedding`
  column once chunk volume grows — V1 relies on a sequential scan,
  which is fine at small scale but won't stay fast forever.
- Wire up the pricing section to real payments (e.g. LemonSqueezy or Stripe).
