import os
import logging
from typing import List, Dict, Any
import pypdf

logger = logging.getLogger("rag.ingestion.loader")

def extract_text_from_pdf(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text per page from a PDF file using pypdf.
    Returns a list of dicts: [{"page_number": 1, "text": "..."}]
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at {pdf_path}")

    pages_content = []
    filename = os.path.basename(pdf_path)

    try:
        reader = pypdf.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        logger.info(f"Processing '{filename}' with {total_pages} pages.")

        for i, page in enumerate(reader.pages):
            page_number = i + 1
            try:
                extracted_text = page.extract_text() or ""
                cleaned_text = extracted_text.strip()
                if not cleaned_text:
                    logger.warning(f"Page {page_number} in '{filename}' had no extractable text. Skipping (scanned/empty page).")
                    continue
                pages_content.append({
                    "page_number": page_number,
                    "text": cleaned_text
                })
            except Exception as e:
                logger.error(f"Error extracting page {page_number} in '{filename}': {e}")
                continue

    except Exception as e:
        logger.error(f"Failed to read PDF file '{pdf_path}': {e}")

    return pages_content

def load_all_pdfs(directory: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Scans directory for all .pdf files and extracts text per page.
    Returns: { "filename.pdf": [{"page_number": 1, "text": "..."}, ...] }
    """
    if not os.path.exists(directory):
        logger.warning(f"Directory {directory} does not exist.")
        return {}

    all_docs = {}
    for entry in os.listdir(directory):
        if entry.lower().endswith(".pdf"):
            full_path = os.path.join(directory, entry)
            extracted = extract_text_from_pdf(full_path)
            if extracted:
                all_docs[entry] = extracted

    return all_docs
