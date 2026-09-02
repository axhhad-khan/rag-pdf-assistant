"""
PDF Service
-----------
INPUT:   path to a PDF file on disk
PROCESS: open it with PyMuPDF (fitz), walk every page, extract raw text,
         and clean it up (collapse whitespace, drop empty pages)
OUTPUT:  a list of {"page_number": int, "text": str} — one entry per
         non-empty page, ready to be handed to the chunking service.

Why keep page numbers this early?
Because once text from different pages is merged and chunked, there is
no way to recover which page a chunk came from unless we tag it before
merging. Page numbers are what let us cite sources later.
"""

import re

import fitz  # PyMuPDF


class PDFExtractionError(Exception):
    pass


def _clean_text(text: str) -> str:
    # Collapse repeated whitespace/newlines into single spaces so chunking
    # later operates on clean, predictable text.
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_pages(file_path: str) -> list[dict]:
    """
    Returns a list like:
    [{"page_number": 1, "text": "..."}, {"page_number": 2, "text": "..."}, ...]

    Pages with no extractable text (e.g. pure-image scans without OCR)
    are skipped.
    """
    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        raise PDFExtractionError(f"Could not open PDF: {exc}") from exc

    if doc.page_count == 0:
        doc.close()
        raise PDFExtractionError("PDF has no pages.")

    pages = []
    for page_index in range(doc.page_count):
        raw_text = doc[page_index].get_text("text")
        cleaned = _clean_text(raw_text)
        if cleaned:
            pages.append({"page_number": page_index + 1, "text": cleaned})

    doc.close()

    if not pages:
        raise PDFExtractionError(
            "No extractable text found in this PDF. It may be a scanned "
            "image without OCR, which this version does not support."
        )

    return pages
