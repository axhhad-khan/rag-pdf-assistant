```markdown
# DocuChat — AI PDF Chat Assistant (RAG, Built from Scratch)

> A production-grade, multi-user Retrieval-Augmented Generation (RAG) SaaS application that lets users upload PDF documents and query them in natural language with page-level source citations. 

Built **entirely without abstract orchestration frameworks like LangChain or LlamaIndex**, this project exposes every layer of the modern RAG pipeline in clean, modular Python and React.

---

## 📸 Overview & Architecture

```text
USER
 ↓
AUTHENTICATION (JWT / Bcrypt)
 ↓
UPLOAD PDF
 ↓
TEXT EXTRACTION (PyMuPDF)
 ↓
CHUNKING (Custom Overlapping Windows)
 ↓
EMBEDDING (Sentence-Transformers / all-MiniLM-L6-v2)
 ↓
POSTGRESQL + PGVECTOR (Native Vector Storage)
 ↓
QUESTION → EMBEDDING → COSINE SIMILARITY SEARCH (User-Scoped)
 ↓
TOP-K RELEVANT CHUNKS + CONTEXT
 ↓
LLM GENERATION (OpenAI API)
 ↓
GROUNDED ANSWER + PAGE CITATIONS

```

```text
┌─────────────┐      ┌──────────────┐      ┌──────────────────────────┐
│   React     │ HTTP │   FastAPI    │      │   PostgreSQL + pgvector  │
│   Frontend  │◄────►│   Backend    │◄────►│  users, documents,       │
│  (Vite, TS) │ JWT  │              │      │  chunks, conversations   │
└─────────────┘      └──────┬───────┘      └──────────────────────────┘
                            │              
                            ▼              
                     ┌──────────────┐      
                     │  OpenAI API  │      
                     │ (Generation) │      
                     └──────────────┘      

```

---

## 📋 Table of Contents

* [Core Features](https://www.google.com/search?q=%23core-features)
* [Concepts Explained](https://www.google.com/search?q=%23concepts-explained)
* [Quick Start](https://www.google.com/search?q=%23quick-start)
* [Pipeline Deep-Dive](https://www.google.com/search?q=%23pipeline-deep-dive)
* [Security & User Isolation](https://www.google.com/search?q=%23security--user-isolation)
* [API Reference](https://www.google.com/search?q=%23api-reference)
* [Project Structure](https://www.google.com/search?q=%23project-structure)
* [Testing Suite](https://www.google.com/search?q=%23testing-suite)
* [Why Vanilla Python over LangChain/LlamaIndex?](https://www.google.com/search?q=%23why-vanilla-python-over-langchainllamaindex)
* [Production Roadmap](https://www.google.com/search?q=%23production-roadmap)

---

## ✨ Core Features

* **Zero-Framework Pipeline:** Transparent, customizable implementations of text ingestion, chunking strategies, vector math, and context assembly.
* **Strict Multi-Tenant Isolation:** Vector similarity search and relational records are strictly scoped at the database query level (`WHERE user_id = current_user`).
* **Page-Level Source Grounding:** Every chat response references the exact source document and page number to eliminate hallucination risks.
* **Robust Authentication:** Secure JWT-based auth flow with salted bcrypt password hashing and persistent session handling.
* **Modern Stack:** Built on FastAPI, SQLAlchemy, PostgreSQL (`pgvector`), React, Vite, and Tailwind CSS.

---

## 🧠 Concepts Explained

* **RAG (Retrieval-Augmented Generation):** A technique where, instead of asking an LLM a question directly, you first *retrieve* the most relevant pieces of your own data, hand the LLM the question **plus** that retrieved context, and ask it to answer using only that context.
* **Embeddings:** Converting text into a vector (list of numbers) such that texts with similar meaning end up close together in numeric space. This lets us search by meaning instead of exact keyword matches.
* **Vector Database & pgvector:** A database optimized for storing and querying vectors. `pgvector` is a PostgreSQL extension that adds native vector columns, meaning we get vector search *and* normal relational data in one place.
* **Cosine Similarity:** A measure of how similar two vectors' directions are. `pgvector` exposes cosine distance, which we convert: `similarity = 1 - cosine_distance`.
* **Top-K Retrieval:** We retrieve only the `K` closest chunks (K=5 by default) to predictably bound how much context is sent to the LLM.

---

## 🚀 Quick Start (Local Setup)

This project runs entirely on your local machine — no Docker required. Ensure you have **Python 3.11+**, **Node.js 20+**, and **PostgreSQL 16+** with the **pgvector** extension installed locally.

### 1. Database Setup

Make sure the PostgreSQL service is running, then create the database:

```bash
# macOS (Homebrew)
brew services start postgresql@16

# Ubuntu/Debian
sudo service postgresql start

# Create the database
psql -U postgres -c "CREATE DATABASE rag_pdf_assistant;"

```

### 2. Backend Configuration

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and configure your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY

```

Run the backend server:

```bash
uvicorn app.main:app --reload

```

*(The app automatically provisions the `vector` extension and required database tables on initial startup).*

### 3. Frontend Configuration

In a separate terminal window:

```bash
cd frontend
npm install

cp .env.example .env.local
# Verify API base URL matches http://localhost:8000

npm run dev

```

* **Frontend App:** `http://localhost:5173`
* **Interactive API Docs (Swagger):** `http://localhost:8000/docs`
* **Health Check Endpoint:** `http://localhost:8000/health`

---

## 🔍 Pipeline Deep-Dive

Each core engine service (`backend/app/services/`) follows strict **INPUT → PROCESS → OUTPUT** boundaries:

| Pipeline Stage | Implementation | Functionality Summary |
| --- | --- | --- |
| **PDF Ingestion** | `pdf_service.py` | Extracts raw text layout-safely using PyMuPDF, scrubbing whitespace anomalies. |
| **Chunking** | `chunking_service.py` | Splits text into overlapping word windows (e.g., 600-word limit with 100-word overlap) to preserve contextual continuity across boundaries. |
| **Embedding** | `embedding_service.py` | Generates 384-dimensional dense vectors using Sentence-Transformers (`all-MiniLM-L6-v2`). |
| **Vector Storage** | `PostgreSQL + pgvector` | Stores embeddings in native `vector(384)` columns alongside relational metadata (document ID, user ID, page numbers). |
| **Retrieval** | `retrieval_service.py` | Embeds incoming queries, applies user-scoped filters, computes cosine distance (`<=>`), and filters out low-relevance results via Top-K. |
| **Generation** | `llm_service.py` | Injects retrieved chunks into a strict system prompt instructing the model to reply **only** using provided context or abort if missing. |

---

## 🔒 Security & User Isolation

Multi-tenant data safety is enforced at the database driver layer rather than application logic alone:

1. **At Rest & In Transit:** Passwords use cryptographic bcrypt hashing; API sessions are governed by short-lived signed JSON Web Tokens (JWT).
2. **Pre-Filter Vector Indexing:** All vector operations evaluate user scopes *before* ranking distance metrics. User A cannot mathematically pull vector fragments belonging to User B, even with identical query text.

---

## 📚 API Reference

| Endpoint Group | Method & Route | Description | Auth Required |
| --- | --- | --- | --- |
| **Auth** | `POST /auth/register` | Register new user account, returns JWT. | No |
|  | `POST /auth/login` | Authenticate user credentials, returns JWT. | No |
|  | `GET /auth/me` | Fetch active user profile details. | Yes |
| **Documents** | `POST /documents/upload` | Upload PDF file and trigger full parsing/embedding pipeline. | Yes |
|  | `GET /documents/` | List all documents owned by the active user. | Yes |
|  | `DELETE /documents/{id}` | Purge document, cascading deletes relational chunks. | Yes |
| **Chat** | `POST /chat/chat` | Send a query, create/append conversation, return RAG answer. | Yes |
|  | `GET /chat/conversations` | Retrieve user chat session history. | Yes |
| **System** | `GET /health` | Application liveness and database connection status check. | No |

---

## 🗂️ Project Structure

```text
rag-pdf-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, startup, CORS, error handler
│   │   ├── config.py                # App settings from env vars
│   │   ├── api/                     # Route handlers (auth, documents, chat)
│   │   ├── models/                  # SQLAlchemy models (User, Document, Chunk...)
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── services/                # RAG pipeline logic (chunking, embedding, llm)
│   │   ├── database/                # DB engine + session
│   │   └── dependencies/            # Auth dependencies
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                   # React views
│   │   ├── components/              # Layouts, Protected Routes
│   │   ├── services/                # Axios API client
│   │   ├── hooks/                   # Custom React hooks (useAuth)
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
└── README.md

```

---

## 🧪 Testing Suite

Create a separate local test database (once):

```bash
psql -U postgres -c "CREATE DATABASE rag_pdf_assistant_test;"

```

Execute backend integration and unit tests:

```bash
cd backend
source venv/bin/activate
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag_pdf_assistant_test
pytest -v

```

*Coverage includes auth flows, document validation, chunk overlap correctness, semantic similarity sanity checks, and strict user-isolation tests.*

---

## 🛠️ Why Vanilla Python over LangChain / LlamaIndex?

This project deliberately avoids abstract frameworks so every step is visible. If you later adopt one, here is what they replace:

| Manual Implementation (This Repo) | LangChain/LlamaIndex Equivalent |
| --- | --- |
| `pdf_service.py` + `chunking_service.py` | `PyPDFLoader` + `RecursiveCharacterTextSplitter` |
| `embedding_service.py` | `HuggingFaceEmbeddings` / `OpenAIEmbeddings` wrapper |
| Manual pgvector inserts | `PGVector` store class with `.add_documents()` |
| `retrieval_service.py` query logic | `vectorstore.as_retriever(search_kwargs=...)` |
| `llm_service.py` manual prompt + call | `ConversationalRetrievalChain` |

**The Trade-off:** Frameworks remove boilerplate quickly but hide the mechanics of how a question becomes an embedding, how it's compared against vectors, and how winning chunks become an LLM prompt. This repo is built to teach exactly that.

---

## 🗺️ Production Upgrade Roadmap

* [ ] **Asynchronous Task Queue:** Move PDF ingestion (`process_document`) into a background task (Celery, RQ) so uploads don't block the request.
* [ ] **Token Rotation:** Upgrade to dual token schemes (Access / Refresh tokens) for robust session management.
* [ ] **Pagination:** Add pagination to document and conversation lists.
* [ ] **OCR Integration:** Fall back to Tesseract OCR for scanned PDF documents with non-extractable text layers.
* [ ] **Vector Indexes:** Implement `hnsw` or `ivfflat` indexing on the `embedding` column for ultra-fast vector scans as chunk volume grows.
* [ ] **Payments:** Wire up the pricing tier section to real payments (Stripe/LemonSqueezy).

```

```
