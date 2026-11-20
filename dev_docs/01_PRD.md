# Product Requirements Document — PDF RAG Chatbot

## 1. Overview
A chatbot that answers user questions by retrieving relevant passages from a corpus of PDF
documents and generating grounded answers with citations back to the source documents.

## 2. Problem Statement
Users need to find and understand information buried in a collection of PDF documents without
manually searching or reading through each file.

## 3. Goals
- Ingest a folder of PDF documents into a searchable knowledge base.
- Let a user ask natural-language questions and get accurate, source-grounded answers.
- Show which document(s) and page(s) an answer came from (citations).
- Provide a simple chat UI accessible in a browser.
- Support re-ingesting/updating the document set without a full rebuild when possible.

## 4. Non-Goals (v1)
- Multi-user authentication / access control.
- Support for non-PDF file types (images, Word, HTML) — may come later.
- Real-time collaborative chat / multi-turn memory across sessions (single-session memory is fine).
- Fine-tuning a custom model.

## 5. Target User
A single user or small internal team who has a folder of PDFs (reports, manuals, policies,
research papers, etc.) and wants a fast Q&A interface over them.

## 6. Core User Stories
1. As a user, I can upload/drop PDFs into a folder and run an ingestion step to index them.
2. As a user, I can open a chat UI and ask a question in plain English.
3. As a user, I receive an answer that is grounded in the documents, with citations
   (document name + page number) shown alongside the answer.
4. As a user, if the answer isn't in the documents, the bot tells me it doesn't know rather
   than making something up.
5. As a user, I can see my conversation history within a session.

## 7. Functional Requirements
- **Ingestion:** Extract text from PDFs, split into chunks, generate embeddings, store in a
  vector database along with metadata (source file, page number).
- **Retrieval:** Given a user query, embed it and retrieve the top-k most relevant chunks.
- **Generation:** Pass retrieved chunks + user question to an LLM to generate an answer.
- **Citations:** Return the source file/page for each chunk used in the answer.
- **Chat UI:** Simple web interface: message input, streamed/response bubbles, citation display.
- **API:** Backend exposes REST endpoints the frontend (or other clients) can call.

## 8. Non-Functional Requirements
- Answers should return in under ~5 seconds for a typical query on a moderate corpus (<500 pages).
- System should run locally on a developer machine without requiring paid infrastructure
  beyond an LLM API key.
- Codebase should be modular so the vector DB, embedding model, or LLM provider can be swapped
  via config, not code rewrites.

## 9. Success Metrics
- Answers are factually grounded in retrieved content (no hallucinated facts) for a manual
  test set of ~20 sample questions.
- Correct source document is retrieved in the top-3 chunks for at least 80% of test questions.

## 10. Open Questions / Assumptions
- Assuming single-user, local/dev deployment for v1 (no auth, no multi-tenant).
- Assuming PDFs are primarily text-based (not scanned images) — OCR is out of scope for v1
  unless specified later.
- LLM provider defaults to OpenAI; should be swappable via `.env` config.
