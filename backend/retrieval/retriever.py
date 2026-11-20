import logging
from typing import List, Dict, Any
from backend.retrieval.embedder import generate_query_embedding
from backend.retrieval.vector_store import vector_store_instance
from backend.config import settings

logger = logging.getLogger("rag.retrieval.retriever")

def retrieve_relevant_chunks(query: str, top_k: int = None) -> List[Dict[str, Any]]:
    """
    Retrieves the top_k most similar document chunks for a given query.
    """
    if top_k is None:
        top_k = settings.TOP_K

    if not query or not query.strip():
        return []

    logger.info(f"Retrieving top {top_k} chunks for query: '{query}'")
    query_vector = generate_query_embedding(query.strip())
    matched_chunks = vector_store_instance.query(query_vector, top_k=top_k)
    return matched_chunks
