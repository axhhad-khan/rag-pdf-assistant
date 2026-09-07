<div align="center">
  
# 📄 DocuChat
**AI PDF Chat Assistant (RAG, Built from Scratch)**

[![Python Version](https://img.shields.io/badge/Python-3.11%2B-blue.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![Node.js Version](https://img.shields.io/badge/Node.js-20%2B-success.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-316192.svg?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-Vite-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade, multi-user Retrieval-Augmented Generation (RAG) SaaS application that lets users upload PDF documents and query them in natural language with page-level source citations.

Built **entirely without abstract orchestration frameworks like LangChain or LlamaIndex**, this project exposes every layer of the modern RAG pipeline in clean, modular Python and React.

</div>

---

## 📋 Table of Contents

- [📸 Overview & Architecture](#-overview--architecture)
- [✨ Core Features](#-core-features)
- [🚀 Quick Start (Local Setup)](#-quick-start-local-setup)
- [🔍 Pipeline Deep-Dive](#-pipeline-deep-dive)
- [🔒 Security & User Isolation](#-security--user-isolation)
- [📚 API Reference](#-api-reference)
- [🗂️ Project Structure](#️-project-structure)
- [🧪 Testing Suite](#-testing-suite)
- [🛠️ Why Vanilla Python?](#️-why-vanilla-python-over-langchain--llamaindex)
- [🗺️ Production Upgrade Roadmap](#️-production-upgrade-roadmap)

---

## 📸 Overview & Architecture

### The RAG Pipeline
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
