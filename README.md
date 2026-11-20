# DocChat — Grounded PDF RAG Chatbot & Knowledge Workspace

DocChat is an enterprise-grade PDF Retrieval-Augmented Generation (RAG) Chatbot that indexes a folder of PDF documents into a vector database (ChromaDB) and answers natural language questions with strict grounding and verifiable source citations (document name + page numbers).

---

## 🌟 Key Features

1. **Grounded PDF RAG Chatbot**: Answers natural language questions strictly using retrieved PDF passages. Prevents hallucinations and explicitly states when information is unavailable.
2. **Interactive Citation Inspector**: Clickable citation chips (e.g. `[Enterprise_SaaS_Master_Agreement.pdf, Page 2]`) open a side-panel drawer displaying the exact matched passage, cosine similarity score, and embedded page preview.
3. **Document Management Dashboard**:
   - Drag & drop PDF ingestion zone.
   - Real-time indexing health and storage metrics.
   - Per-file chunk counts, page counts, re-indexing, and deletion.
4. **Customizable Retrieval**: Adjust `top_k` (3, 5, 8, 10) on the fly for query similarity search.
5. **Session Management**: Session history categorized into "Today" and "Previous 7 Days", with JSON transcript export capability.
6. **Provider Swappability**: Abstracted embedder and LLM clients (defaults to OpenAI `text-embedding-3-small` and `gpt-4o-mini`, with offline deterministic fallback).

---

## 📐 Project Architecture

```
corpus/
├── backend/
│   ├── main.py                # FastAPI entry point & CORS
│   ├── config.py              # Pydantic env settings
│   ├── ingestion/             # PDF text extraction & chunking
│   │   ├── loader.py          # pypdf text loader
│   │   ├── chunker.py         # tiktoken token-aware splitter
│   │   └── ingest.py          # Pipeline runner & CLI
│   ├── retrieval/             # Vector store & search
│   │   ├── embedder.py        # OpenAI embedding generator
│   │   ├── vector_store.py    # ChromaDB wrapper
│   │   └── retriever.py       # Similarity search
│   ├── generation/            # Grounded LLM generation
│   │   ├── prompt_builder.py  # System prompt & context builder
│   │   └── llm_client.py      # OpenAI chat completion
│   └── api/
│       └── routes.py          # /chat, /ingest, /upload, /documents, /health
├── frontend/                  # React + TypeScript + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── WelcomeState.tsx
│   │   │   ├── ChatWorkspace.tsx
│   │   │   ├── CitationInspector.tsx
│   │   │   ├── DocumentLibrary.tsx
│   │   │   └── UsageAnalytics.tsx
│   │   ├── api/client.ts
│   │   └── App.tsx
│   └── index.html
├── dev_docs/                  # Product specs, architecture, tech stack & tasks
├── design_docs/               # Design tokens, color palette, typography & HTML/CSS
├── data/
│   ├── raw_pdfs/              # PDF storage folder
│   └── vector_store/          # Persistent ChromaDB storage
├── .env.example               # Environment template
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup

1. Configure environment variables in `.env` (copied from `.env.example`):
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   EMBEDDING_MODEL=text-embedding-3-small
   LLM_MODEL=gpt-4o-mini
   VECTOR_STORE_PATH=./data/vector_store
   RAW_PDFS_PATH=./data/raw_pdfs
   CHUNK_SIZE=700
   CHUNK_OVERLAP=100
   TOP_K=5
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run the PDF ingestion pipeline to index PDFs in `data/raw_pdfs/`:
   ```bash
   python -m backend.ingestion.ingest
   ```

4. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Interactive API docs available at:* `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend UI accessible at:* `http://localhost:5173`

---

## 🧪 API Endpoints

- `POST /api/chat`: Send user question (`{ message, session_id, top_k }`) and receive grounded answer with array of citations.
- `POST /api/ingest`: Trigger full re-ingestion of `data/raw_pdfs/`.
- `POST /api/upload`: Upload a `.pdf` file to add it to raw_pdfs and index it immediately.
- `GET /api/documents`: List indexed documents, file size, page count, and status.
- `DELETE /api/documents/{filename}`: Remove a PDF document and its vector chunks.
- `GET /api/health`: Liveness & vector collection stats.

---

## 🎨 Design System

- **Primary Color**: `#3525CD` / `#4F46E5` (Indigo)
- **Background**: `#F8FAFC` (Slate Surface)
- **Typography**: `Inter` (UI & Body), `JetBrains Mono` (Code & Page Indexes), `Material Symbols Outlined` (Icons)
