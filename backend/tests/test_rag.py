import io

import fitz

from app.services.chunking_service import chunk_text, chunk_pages
from app.services.embedding_service import embed_text, embed_texts


def make_pdf_bytes(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def test_chunk_text_respects_overlap():
    words = [f"word{i}" for i in range(1000)]
    text = " ".join(words)
    chunks = chunk_text(text, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    # Consecutive chunks should share the overlapping words
    first_chunk_words = chunks[0].split()
    second_chunk_words = chunks[1].split()
    assert first_chunk_words[-20:] == second_chunk_words[:20]


def test_chunk_pages_keeps_page_numbers():
    pages = [{"page_number": 1, "text": "a " * 50}, {"page_number": 2, "text": "b " * 50}]
    records = chunk_pages(pages)
    page_numbers = {r["page_number"] for r in records}
    assert page_numbers == {1, 2}


def test_embed_text_returns_correct_dimension():
    vector = embed_text("Supervised learning uses labeled data.")
    assert len(vector) == 384


def test_embed_texts_batch():
    vectors = embed_texts(["cat", "dog", "car"])
    assert len(vectors) == 3
    assert all(len(v) == 384 for v in vectors)


def test_similar_sentences_have_higher_similarity_than_unrelated():
    import numpy as np

    a = np.array(embed_text("Supervised learning uses labeled training data."))
    b = np.array(embed_text("Labeled data is used in supervised machine learning."))
    c = np.array(embed_text("The weather in Karachi is hot in summer."))

    sim_ab = float(np.dot(a, b))
    sim_ac = float(np.dot(a, c))
    assert sim_ab > sim_ac


def test_user_isolation_in_retrieval(client, db_session):
    # User A registers and uploads a document
    client.post("/auth/register", json={"name": "A", "email": "a@example.com", "password": "password123"})
    login_a = client.post("/auth/login", json={"email": "a@example.com", "password": "password123"})
    headers_a = {"Authorization": f"Bearer {login_a.json()['access_token']}"}

    pdf_bytes = make_pdf_bytes("The secret project codename is Falcon.")
    client.post(
        "/documents/upload",
        headers=headers_a,
        files={"file": ("secret.pdf", pdf_bytes, "application/pdf")},
    )

    # User B registers and has no documents
    client.post("/auth/register", json={"name": "B", "email": "b@example.com", "password": "password123"})
    login_b = client.post("/auth/login", json={"email": "b@example.com", "password": "password123"})
    headers_b = {"Authorization": f"Bearer {login_b.json()['access_token']}"}

    # User B asks a question — should NOT retrieve User A's chunks
    response = client.post("/chat", headers=headers_b, json={"question": "What is the codename?"})
    assert response.status_code == 400  # B has no documents at all, per the guard in the chat route
