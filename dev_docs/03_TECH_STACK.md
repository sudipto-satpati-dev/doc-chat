# Tech Stack — PDF RAG Chatbot

## Backend
| Layer | Choice | Why |
|---|---|---|
| Language | Python 3.11+ | Best ecosystem for RAG/ML tooling |
| Web framework | FastAPI | Async, typed, auto-generates OpenAPI docs, easy for agents to scaffold |
| PDF text extraction | `pypdf` (fallback `pdfplumber` for tricky layouts) | Lightweight, no external service |
| Chunking | Custom function (token-based, using `tiktoken` for counting) | Full control over chunk size/overlap and metadata attachment |
| Embeddings | OpenAI `text-embedding-3-small` | Cheap, fast, strong quality; swappable via config |
| Vector store | ChromaDB (local, persistent) | No external infra, simple Python API, good for <1M vectors |
| LLM | OpenAI `gpt-4o-mini` (default), swappable | Good quality/cost balance; abstracted behind `llm_client.py` |
| Config | `python-dotenv` + `pydantic-settings` | Type-safe env config |
| Server | `uvicorn` | Standard ASGI server for FastAPI |

## Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast dev loop, minimal boilerplate |
| Language | TypeScript | Type safety for API contracts |
| Styling | Plain CSS / CSS modules | Keep it lightweight, no heavy UI framework needed for v1 |
| HTTP client | `fetch` (native) | No extra dependency needed |

## Dev / Ops
| Item | Choice |
|---|---|
| Package management (backend) | `pip` + `requirements.txt` (or `uv` if available) |
| Package management (frontend) | `npm` |
| Environment secrets | `.env` file (never committed), `.env.example` provided |
| Version control | Git, with `data/vector_store/` and `.env` gitignored |

## Swappability Notes (for future iteration)
- **Vector store:** `vector_store.py` wraps ChromaDB behind a small interface
  (`add(chunks)`, `query(vector, k)`) so it can be swapped for Qdrant/Pinecone/pgvector later
  without touching retrieval logic.
- **Embeddings/LLM provider:** both are read from `EMBEDDING_PROVIDER` / `LLM_PROVIDER` env vars;
  `embedder.py` and `llm_client.py` should branch on provider so Anthropic/local models
  (e.g. via Ollama) can be added later.

## Environment Variables (`.env.example`)
```
OPENAI_API_KEY=your_key_here
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
VECTOR_STORE_PATH=./data/vector_store
CHUNK_SIZE=700
CHUNK_OVERLAP=100
TOP_K=5
```
