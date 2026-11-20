# Architecture — PDF RAG Chatbot

## 1. High-Level Diagram (textual)

```
                ┌─────────────────────┐
                │   PDF Documents      │
                │   (data/raw_pdfs/)   │
                └──────────┬───────────┘
                           │  ingestion script
                           ▼
   ┌───────────────────────────────────────────┐
   │  Ingestion Pipeline                        │
   │  1. Extract text (per page)                │
   │  2. Chunk text (with overlap)               │
   │  3. Generate embeddings                     │
   │  4. Store vectors + metadata                │
   └──────────────────────┬──────────────────────┘
                           ▼
                ┌─────────────────────┐
                │   Vector Store        │
                │   (ChromaDB, local)   │
                └──────────┬───────────┘
                           ▲
                           │  similarity search (top-k)
   ┌───────────────────────┴──────────────────────┐
   │  FastAPI Backend                              │
   │  - /chat endpoint                              │
   │  - retrieves chunks, builds prompt             │
   │  - calls LLM, returns answer + citations       │
   └───────────────────────┬──────────────────────┘
                           ▲ REST (JSON over HTTP)
                           │
                ┌─────────────────────┐
                │   React Chat UI       │
                │   (Vite frontend)      │
                └─────────────────────┘
```

## 2. Components

### 2.1 Ingestion Pipeline (offline / batch, run manually or on file change)
- **PDF Loader:** reads files from `data/raw_pdfs/`, extracts text per page (`pypdf` or
  `pdfplumber`).
- **Chunker:** splits page text into overlapping chunks (~500-800 tokens, ~100 token overlap),
  preserving `source_file` and `page_number` metadata on each chunk.
- **Embedder:** calls the embedding model to convert each chunk into a vector.
- **Vector Store Writer:** writes `{id, vector, text, metadata}` into ChromaDB, persisted to disk
  at `data/vector_store/`.

### 2.2 Retrieval + Generation (online, per request)
- Embed the incoming user query with the same embedding model used at ingestion.
- Query ChromaDB for the top-k (default k=5) most similar chunks.
- Build a prompt: system instructions + retrieved chunks (with source labels) + chat history +
  user question.
- Call the LLM; parse the response.
- Return answer text + list of citations (deduplicated source file/page pairs actually used).

### 2.3 Backend (FastAPI)
- Thin HTTP layer over the retrieval + generation logic.
- Stateless per request except for in-memory session chat history (v1: single session, no DB).
- Config-driven: embedding model, LLM model, vector store path, chunk size all read from `.env`
  / `config.py`.

### 2.4 Frontend (React + Vite)
- Single-page chat interface.
- Sends `POST /chat` with `{message, session_id}`.
- Renders assistant reply with a "Sources" section listing document name + page number.

## 3. Data Flow Summary
1. **Ingest (offline):** PDFs → text → chunks → embeddings → ChromaDB.
2. **Query (online):** User question → embed → retrieve top-k chunks → prompt LLM → answer +
   citations → display in UI.

## 4. Key Design Decisions
- **No orchestration framework (no LangChain/LlamaIndex):** keeps the pipeline transparent and
  easy for an AI coding agent to generate correctly and for a human to debug. All logic (chunking,
  retrieval, prompt building) is plain Python functions.
- **ChromaDB, local persistence:** zero external infra, runs on a laptop, good enough for
  small-to-medium corpora. Swappable later for Qdrant/Pinecone if scale requires it.
- **Config-driven providers:** embedding/LLM provider is set via env vars so swapping OpenAI for
  Anthropic or a local model doesn't require touching pipeline code.

## 5. Folder Structure

```
rag-project/
├── backend/
│   ├── main.py                # FastAPI app entrypoint
│   ├── config.py              # env-driven settings
│   ├── ingestion/
│   │   ├── loader.py          # PDF text extraction
│   │   ├── chunker.py         # text chunking
│   │   └── ingest.py          # orchestrates full ingestion run
│   ├── retrieval/
│   │   ├── embedder.py        # embedding calls
│   │   ├── vector_store.py    # ChromaDB wrapper
│   │   └── retriever.py       # top-k retrieval logic
│   ├── generation/
│   │   ├── prompt_builder.py  # builds LLM prompt from chunks + question
│   │   └── llm_client.py      # LLM API wrapper
│   ├── api/
│   │   └── routes.py          # /chat, /ingest, /health endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/ChatWindow.tsx
│   │   └── api/client.ts
│   ├── package.json
│   └── vite.config.ts
├── data/
│   ├── raw_pdfs/               # user drops PDFs here
│   └── vector_store/           # ChromaDB persistence (gitignored)
├── .env.example
└── README.md
```
