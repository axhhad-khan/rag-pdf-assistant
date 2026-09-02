import io

import fitz  # PyMuPDF


def make_pdf_bytes(text: str = "Hello world. This is a test PDF about machine learning.") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def test_upload_document(client, auth_headers):
    pdf_bytes = make_pdf_bytes()
    response = client.post(
        "/documents/upload",
        headers=auth_headers,
        files={"file": ("test.pdf", pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["filename"] == "test.pdf"
    assert body["status"] == "completed"
    assert body["chunk_count"] >= 1


def test_upload_rejects_non_pdf(client, auth_headers):
    response = client.post(
        "/documents/upload",
        headers=auth_headers,
        files={"file": ("test.txt", b"not a pdf", "text/plain")},
    )
    assert response.status_code == 400


def test_upload_rejects_empty_file(client, auth_headers):
    response = client.post(
        "/documents/upload",
        headers=auth_headers,
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert response.status_code == 400


def test_list_documents_only_shows_own(client, auth_headers):
    pdf_bytes = make_pdf_bytes()
    client.post(
        "/documents/upload",
        headers=auth_headers,
        files={"file": ("mine.pdf", pdf_bytes, "application/pdf")},
    )
    response = client.get("/documents/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_delete_document(client, auth_headers):
    pdf_bytes = make_pdf_bytes()
    upload = client.post(
        "/documents/upload",
        headers=auth_headers,
        files={"file": ("delete-me.pdf", pdf_bytes, "application/pdf")},
    )
    doc_id = upload.json()["id"]
    response = client.delete(f"/documents/{doc_id}", headers=auth_headers)
    assert response.status_code == 204

    get_response = client.get(f"/documents/{doc_id}", headers=auth_headers)
    assert get_response.status_code == 404
