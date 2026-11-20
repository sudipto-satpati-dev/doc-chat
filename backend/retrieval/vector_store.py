import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from backend.config import settings

logger = logging.getLogger("rag.retrieval.vector_store")

class VectorStore:
    def __init__(self, collection_name: str = "rag_documents"):
        self.persist_directory = settings.VECTOR_STORE_PATH
        os.makedirs(self.persist_directory, exist_ok=True)

        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=ChromaSettings(allow_reset=True, anonymized_telemetry=False)
        )
        self.collection_name = collection_name
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        if not chunks or not embeddings:
            return

        ids = [c["chunk_id"] for c in chunks]
        documents = [c["text"] for c in chunks]
        metadatas = [
            {
                "source_file": c["source_file"],
                "page_number": c["page_number"]
            }
            for c in chunks
        ]

        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Upserted {len(chunks)} chunks into collection '{self.collection_name}'.")

    def query(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        count = self.collection.count()
        if count == 0:
            return []

        n_results = min(top_k, count)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

        matched_chunks = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if "metadatas" in results else []
            distances = results["distances"][0] if "distances" in results else []
            ids = results["ids"][0] if "ids" in results else []

            for i in range(len(docs)):
                # Convert cosine distance to cosine similarity: similarity = 1 - distance
                dist = distances[i] if i < len(distances) else 0.0
                similarity = max(0.0, 1.0 - dist)
                meta = metas[i] if i < len(metas) else {}

                matched_chunks.append({
                    "chunk_id": ids[i] if i < len(ids) else f"chunk-{i}",
                    "text": docs[i],
                    "source_file": meta.get("source_file", "unknown.pdf"),
                    "page_number": meta.get("page_number", 1),
                    "similarity": round(float(similarity), 4),
                    "distance": round(float(dist), 4)
                })

        return matched_chunks

    def clear(self):
        try:
            self.client.delete_collection(self.collection_name)
        except Exception as e:
            logger.warning(f"Collection deletion error: {e}")
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"Cleared vector store collection '{self.collection_name}'.")

    def delete_document(self, source_file: str):
        try:
            self.collection.delete(where={"source_file": source_file})
            logger.info(f"Deleted chunks for document '{source_file}'.")
        except Exception as e:
            logger.error(f"Error deleting document '{source_file}': {e}")

    def get_stats(self) -> Dict[str, Any]:
        count = self.collection.count()
        documents_metadata = self.collection.get(include=["metadatas"])
        unique_files = set()
        if documents_metadata and "metadatas" in documents_metadata and documents_metadata["metadatas"]:
            for meta in documents_metadata["metadatas"]:
                if meta and "source_file" in meta:
                    unique_files.add(meta["source_file"])

        return {
            "total_chunks": count,
            "total_files": len(unique_files),
            "files": list(unique_files)
        }

    def list_documents(self) -> List[Dict[str, Any]]:
        raw_dir = settings.RAW_PDFS_PATH
        stats = self.get_stats()
        indexed_files = set(stats["files"])

        doc_list = []
        if os.path.exists(raw_dir):
            for filename in os.listdir(raw_dir):
                if filename.lower().endswith(".pdf"):
                    filepath = os.path.join(raw_dir, filename)
                    size_bytes = os.path.getsize(filepath)
                    size_mb = round(size_bytes / (1024 * 1024), 2)

                    # Get chunk count for file
                    file_chunks = self.collection.get(where={"source_file": filename})
                    chunk_count = len(file_chunks["ids"]) if file_chunks and "ids" in file_chunks else 0

                    doc_list.append({
                        "filename": filename,
                        "size_mb": size_mb,
                        "chunk_count": chunk_count,
                        "indexed": filename in indexed_files or chunk_count > 0,
                        "status": "Indexed" if chunk_count > 0 else "Pending"
                    })

        return doc_list

# Singleton instance
vector_store_instance = VectorStore()
