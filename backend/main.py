import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router
from backend.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rag.main")

app = FastAPI(
    title="PDF RAG Chatbot API",
    description="FastAPI Backend for PDF Retrieval-Augmented Generation Chatbot with Citations",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router under /api and root routes for API spec compliance
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

@app.on_event("startup")
def startup_event():
    logger.info(f"Starting PDF RAG Chatbot API...")
    logger.info(f"Vector store path: {settings.VECTOR_STORE_PATH}")
    logger.info(f"Raw PDFs path: {settings.RAW_PDFS_PATH}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
