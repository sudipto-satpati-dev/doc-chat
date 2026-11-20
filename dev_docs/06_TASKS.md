# Development Task Breakdown — PDF RAG Chatbot

Build in this order. Each phase should be runnable/testable before moving to the next.

## Phase 1 — Project Scaffolding
- [ ] Create folder structure as defined in `02_ARCHITECTURE.md`.
- [ ] Set up `backend/requirements.txt` (fastapi, uvicorn, pypdf, tiktoken, chromadb, openai,
      python-dotenv, pydantic-settings).
- [ ] Set up `.env.example` and `config.py` (pydantic-settings reading env vars).
- [ ] Set up frontend with `npm create vite@latest` (React + TypeScript template).

## Phase 2 — Ingestion Pipeline
- [ ] Implement `loader.py`: extract per-page text from PDFs in `data/raw_pdfs/`.
- [ ] Implement `chunker.py`: token-based chunking with overlap, attaching metadata.
- [ ] Implement `embedder.py`: batch embedding calls to the configured provider.
- [ ] Implement `vector_store.py`: ChromaDB wrapper (`add`, `query`, `clear`).
- [ ] Implement `ingest.py`: orchestrates loader → chunker → embedder → vector_store, with a
      CLI entry point and summary output.
- [ ] Test: drop 2-3 sample PDFs in `data/raw_pdfs/`, run ingestion, confirm chunks land in
      the vector store with correct metadata.

## Phase 3 — Retrieval + Generation
- [ ] Implement `retriever.py`: embed query, fetch top-k chunks from vector store.
- [ ] Implement `prompt_builder.py`: assemble system prompt + retrieved chunks (labeled with
      source/page) + chat history + user question.
- [ ] Implement `llm_client.py`: call the configured LLM provider, return response text.
- [ ] Write the grounding instruction into the system prompt: answer only from provided
      context; if the answer isn't present, say so explicitly.
- [ ] Test: manually query the retriever + generator with a known question from the sample PDFs
      and confirm the answer is grounded and citations are correct.

## Phase 4 — Backend API
- [ ] Implement `/health` endpoint.
- [ ] Implement `/ingest` endpoint (wraps the ingestion pipeline).
- [ ] Implement `/chat` endpoint (wraps retrieval + generation, manages session history).
- [ ] Add CORS middleware for the frontend origin.
- [ ] Test all endpoints via the FastAPI auto-generated docs (`/docs`).

## Phase 5 — Frontend Chat UI
- [ ] Build `ChatWindow` component: message list, input box, send button.
- [ ] Wire up `api/client.ts` to call `POST /chat`.
- [ ] Render assistant messages with a "Sources" section listing citations.
- [ ] Basic loading/error states (e.g. "thinking...", error toast on failure).
- [ ] Generate a `session_id` on page load (e.g. random UUID stored in memory).

## Phase 6 — End-to-End Testing & Polish
- [ ] Prepare a test set of ~15-20 questions against the real document set with expected
      source documents.
- [ ] Run through the test set, checking answer grounding and citation accuracy.
- [ ] Add a top-level `README.md` with setup + run instructions.
- [ ] Add basic error handling polish (empty query, no documents ingested yet, etc.).

## Acceptance Criteria for v1 "Done"
- Running `python -m backend.ingestion.ingest` successfully indexes a folder of sample PDFs.
- Running the backend + frontend, a user can ask a question in the chat UI and get a grounded
  answer with correct source citations within a few seconds.
- Asking something not covered by the documents returns an honest "not found in documents"
  response instead of a hallucinated answer.
