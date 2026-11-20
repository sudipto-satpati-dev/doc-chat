import logging
from typing import List
from openai import OpenAI
import google.generativeai as genai
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from backend.config import settings

logger = logging.getLogger("rag.retrieval.embedder")

# Local embedding function using ONNX MiniLM (100% free, 0 API calls, runs on CPU)
_local_ef = None

def get_local_embedding_function():
    global _local_ef
    if _local_ef is None:
        logger.info("Initializing local CPU embedding model (ONNX MiniLM-L6-v2)...")
        _local_ef = DefaultEmbeddingFunction()
    return _local_ef

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generates vector embeddings using local CPU model, Gemini API, or OpenAI API.
    """
    if not texts:
        return []

    provider = settings.EMBEDDING_PROVIDER.lower()

    if provider == "local":
        ef = get_local_embedding_function()
        return ef(texts)

    elif provider == "gemini":
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.startswith("your_") or not api_key.startswith("AIza"):
            logger.warning("GEMINI_API_KEY invalid or missing. Using fast 100% free local CPU embeddings.")
            ef = get_local_embedding_function()
            return ef(texts)
        
        try:
            genai.configure(api_key=api_key)
            model_name = "models/text-embedding-004"
            embeddings = []
            for text in texts:
                res = genai.embed_content(
                    model=model_name,
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(res["embedding"])
            return embeddings
        except Exception as e:
            logger.warning(f"Google Gemini Embedding API error ({e}). Falling back to 100% free local CPU embeddings.")
            ef = get_local_embedding_function()
            return ef(texts)

    else:
        # OpenAI Provider
        api_key = settings.OPENAI_API_KEY
        if not api_key or api_key.startswith("your_"):
            logger.warning("OPENAI_API_KEY invalid or missing. Using fast 100% free local CPU embeddings.")
            ef = get_local_embedding_function()
            return ef(texts)
        try:
            client = OpenAI(api_key=api_key)
            response = client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=texts
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            logger.warning(f"OpenAI Embedding API Error ({e}). Falling back to 100% free local CPU embeddings.")
            ef = get_local_embedding_function()
            return ef(texts)

def generate_query_embedding(query: str) -> List[float]:
    """
    Generates embedding for a single query string.
    """
    provider = settings.EMBEDDING_PROVIDER.lower()

    if provider == "local":
        ef = get_local_embedding_function()
        return ef([query])[0]

    elif provider == "gemini":
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.startswith("your_") or not api_key.startswith("AIza"):
            ef = get_local_embedding_function()
            return ef([query])[0]
        try:
            genai.configure(api_key=api_key)
            model_name = "models/text-embedding-004"
            res = genai.embed_content(
                model=model_name,
                content=query,
                task_type="retrieval_query"
            )
            return res["embedding"]
        except Exception as e:
            logger.warning(f"Gemini Query Embedding API error ({e}). Using local CPU embedding.")
            ef = get_local_embedding_function()
            return ef([query])[0]
    else:
        embeddings = generate_embeddings([query])
        return embeddings[0]
