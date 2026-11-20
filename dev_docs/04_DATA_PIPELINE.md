# Data Pipeline Spec — Ingestion

## 1. Input
- Directory: `data/raw_pdfs/`
- Any number of `.pdf` files, primarily text-based (not scanned images) for v1.

## 2. Step 1 — Text Extraction
- For each PDF, extract text **per page** (not the whole doc as one blob) using `pypdf`.
- If a page extracts to empty/near-empty text (likely a scanned image), log a warning and skip
  it for v1 (OCR is out of scope unless added later).
- Output per file: a list of `{page_number, text}` objects.

## 3. Step 2 — Chunking
- Chunk each page's text using a token-based splitter (`tiktoken` to count tokens).
- **Chunk size:** ~700 tokens (configurable via `CHUNK_SIZE`).
- **Overlap:** ~100 tokens (configurable via `CHUNK_OVERLAP`) to preserve context across chunk
  boundaries.
- Split on paragraph/sentence boundaries where possible rather than mid-sentence.
- Each chunk carries metadata:
  ```json
  {
    "chunk_id": "uuid",
    "source_file": "policy_manual.pdf",
    "page_number": 12,
    "text": "..."
  }
  ```

## 4. Step 3 — Embedding
- Batch chunks (e.g. 100 at a time) and call the embedding model.
- Store the resulting vector alongside the chunk's text and metadata.
- Handle API rate limits with basic retry/backoff.

## 5. Step 4 — Vector Store Write
- Upsert into ChromaDB collection `rag_documents`:
  - `id`: chunk_id
  - `embedding`: vector
  - `document`: chunk text
  - `metadata`: `{source_file, page_number}`
- Persist to `data/vector_store/` so it survives restarts.

## 6. Re-ingestion / Updates
- v1: support a full re-ingest (clear collection, re-run pipeline) via a CLI command or
  `POST /ingest` endpoint.
- Optional improvement (not required for v1): track file hashes to skip unchanged files on
  re-ingest.

## 7. Error Handling
- Corrupted/unreadable PDF → log and skip, continue with remaining files.
- Empty extracted text → log and skip that page.
- Embedding API failure → retry up to 3 times with exponential backoff, then fail that batch
  with a clear error message (don't silently drop data).

## 8. CLI Entry Point
- `python -m backend.ingestion.ingest` — runs the full pipeline over `data/raw_pdfs/` and
  reports a summary: files processed, pages extracted, chunks created, chunks embedded, any
  files/pages skipped.
