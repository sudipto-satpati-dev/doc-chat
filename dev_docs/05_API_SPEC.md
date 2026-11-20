# API Spec — FastAPI Backend

Base URL (local dev): `http://localhost:8000`

## POST /chat
Send a user message, get a grounded answer with citations.

**Request body**
```json
{
  "session_id": "abc123",
  "message": "What is the refund policy for enterprise customers?"
}
```

**Response body**
```json
{
  "answer": "Enterprise customers can request a refund within 30 days of purchase...",
  "citations": [
    { "source_file": "refund_policy.pdf", "page_number": 3 },
    { "source_file": "refund_policy.pdf", "page_number": 4 }
  ],
  "session_id": "abc123"
}
```

**Behavior**
- If no relevant chunks are found above a similarity threshold, respond with an answer stating
  the information isn't in the documents rather than guessing, and return an empty
  `citations` list.
- Maintains short in-memory chat history per `session_id` for follow-up question context
  (v1: in-memory dict, reset on server restart — no persistent DB required).

## POST /ingest
Triggers a full re-ingestion of everything in `data/raw_pdfs/`.

**Request body:** none required.

**Response body**
```json
{
  "status": "success",
  "files_processed": 12,
  "chunks_created": 340,
  "errors": []
}
```

## GET /health
Simple liveness check.

**Response body**
```json
{ "status": "ok" }
```

## Error Responses
All errors return a standard shape with an appropriate HTTP status code:
```json
{ "error": "message describing what went wrong" }
```
- `400` — malformed request (e.g. missing `message`)
- `500` — internal error (embedding/LLM API failure, vector store error, etc.)

## CORS
Backend should allow requests from the frontend's dev origin (`http://localhost:5173` for Vite)
via FastAPI's CORS middleware.
