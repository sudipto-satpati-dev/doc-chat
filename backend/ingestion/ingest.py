import os
import sys
import logging
from typing import Dict, Any, List
from backend.config import settings
from backend.ingestion.loader import load_all_pdfs, extract_text_from_pdf
from backend.ingestion.chunker import chunk_pages
from backend.retrieval.embedder import generate_embeddings
from backend.retrieval.vector_store import vector_store_instance

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rag.ingestion.ingest")

def run_ingestion_pipeline(raw_pdfs_dir: str = None, clear_existing: bool = True) -> Dict[str, Any]:
    if raw_pdfs_dir is None:
        raw_pdfs_dir = settings.RAW_PDFS_PATH

    os.makedirs(raw_pdfs_dir, exist_ok=True)

    if clear_existing:
        logger.info("Clearing existing vector store collection for full re-ingestion...")
        vector_store_instance.clear()

    pdf_docs = load_all_pdfs(raw_pdfs_dir)

    if not pdf_docs:
        logger.warning(f"No PDF files found in '{raw_pdfs_dir}'.")
        return {
            "status": "success",
            "files_processed": 0,
            "pages_processed": 0,
            "chunks_created": 0,
            "errors": []
        }

    total_files = len(pdf_docs)
    total_pages = 0
    all_chunks: List[Dict[str, Any]] = []

    for filename, pages in pdf_docs.items():
        total_pages += len(pages)
        file_chunks = chunk_pages(
            pages=pages,
            source_file=filename,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        all_chunks.extend(file_chunks)

    if not all_chunks:
        logger.warning("No text chunks generated from PDF files.")
        return {
            "status": "success",
            "files_processed": total_files,
            "pages_processed": total_pages,
            "chunks_created": 0,
            "errors": []
        }

    logger.info(f"Generating embeddings for {len(all_chunks)} chunks...")
    chunk_texts = [c["text"] for c in all_chunks]
    embeddings = generate_embeddings(chunk_texts)

    logger.info("Storing vectors and metadata in ChromaDB...")
    vector_store_instance.add_chunks(all_chunks, embeddings)

    summary = {
        "status": "success",
        "files_processed": total_files,
        "pages_processed": total_pages,
        "chunks_created": len(all_chunks),
        "errors": []
    }
    logger.info(f"Ingestion complete! Summary: {summary}")
    return summary

def ingest_single_pdf(filepath: str) -> Dict[str, Any]:
    """Ingests a single PDF file without wiping the whole vector store."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    filename = os.path.basename(filepath)
    pages = extract_text_from_pdf(filepath)
    if not pages:
        return {"status": "error", "message": f"No extractable text in {filename}", "chunks_created": 0}

    chunks = chunk_pages(
        pages=pages,
        source_file=filename,
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP
    )

    if chunks:
        texts = [c["text"] for c in chunks]
        embeddings = generate_embeddings(texts)
        vector_store_instance.add_chunks(chunks, embeddings)

    return {
        "status": "success",
        "filename": filename,
        "pages_processed": len(pages),
        "chunks_created": len(chunks)
    }

if __name__ == "__main__":
    summary = run_ingestion_pipeline()
    print("Ingestion Summary:", summary)
