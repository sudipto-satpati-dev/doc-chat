import os
import shutil
import uuid
import logging
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel, Field

from backend.config import settings
from backend.retrieval.retriever import retrieve_relevant_chunks
from backend.retrieval.vector_store import vector_store_instance
from backend.generation.prompt_builder import build_prompt
from backend.generation.llm_client import generate_answer
from backend.ingestion.ingest import run_ingestion_pipeline, ingest_single_pdf

logger = logging.getLogger("rag.api.routes")
router = APIRouter()

# In-memory session history: { session_id: [ {"role": "user"/"assistant", "content": "..."} ] }
SESSIONS: Dict[str, List[Dict[str, str]]] = {}

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question")
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    top_k: Optional[int] = Field(default=5, description="Number of context chunks to retrieve")

class CitationItem(BaseModel):
    source_file: str
    page_number: int
    text_snippet: Optional[str] = None
    similarity: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    citations: List[CitationItem]
    session_id: str

@router.get("/health")
def health_check():
    stats = vector_store_instance.get_stats()
    return {
        "status": "ok",
        "indexed_chunks": stats["total_chunks"],
        "indexed_files": stats["total_files"]
    }

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    session_id = request.session_id or str(uuid.uuid4())
    if session_id not in SESSIONS:
        SESSIONS[session_id] = []

    history = SESSIONS[session_id]

    try:
        # Retrieve relevant chunks
        top_k = request.top_k or settings.TOP_K
        chunks = retrieve_relevant_chunks(message, top_k=top_k)

        # Build prompt
        system_prompt, user_prompt = build_prompt(message, chunks, history)

        # Generate LLM answer
        result = generate_answer(system_prompt, user_prompt, chunks)
        answer = result["answer"]
        raw_citations = result["citations"]

        # Append to session history
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": answer})

        # Clean citations
        citations = [
            CitationItem(
                source_file=c["source_file"],
                page_number=c["page_number"],
                text_snippet=c.get("text_snippet"),
                similarity=c.get("similarity")
            )
            for c in raw_citations
        ]

        return ChatResponse(
            answer=answer,
            citations=citations,
            session_id=session_id
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
def trigger_ingest(background_tasks: BackgroundTasks):
    summary = run_ingestion_pipeline()
    return summary

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    raw_dir = settings.RAW_PDFS_PATH
    os.makedirs(raw_dir, exist_ok=True)
    target_path = os.path.join(raw_dir, file.filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Ingest the uploaded PDF
    result = ingest_single_pdf(target_path)
    return {
        "status": "success",
        "filename": file.filename,
        "detail": result
    }

@router.get("/documents")
def list_documents():
    docs = vector_store_instance.list_documents()
    stats = vector_store_instance.get_stats()
    return {
        "documents": docs,
        "total_files": stats["total_files"],
        "total_chunks": stats["total_chunks"]
    }

@router.delete("/documents/{filename}")
def delete_document(filename: str):
    raw_dir = settings.RAW_PDFS_PATH
    filepath = os.path.join(raw_dir, filename)

    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            logger.error(f"Error removing file {filepath}: {e}")

    vector_store_instance.delete_document(filename)
    return {"status": "success", "message": f"Document '{filename}' deleted."}
