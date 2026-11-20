import uuid
import logging
from typing import List, Dict, Any
import tiktoken

logger = logging.getLogger("rag.ingestion.chunker")

def count_tokens(text: str, model_name: str = "gpt-4o-mini") -> int:
    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except Exception:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def chunk_pages(
    pages: List[Dict[str, Any]],
    source_file: str,
    chunk_size: int = 700,
    chunk_overlap: int = 100
) -> List[Dict[str, Any]]:
    """
    Splits per-page text into overlapping chunks using token counting.
    Returns a list of dicts:
    [
        {
            "chunk_id": "...",
            "source_file": "...",
            "page_number": 1,
            "text": "..."
        }
    ]
    """
    chunks = []
    try:
        encoding = tiktoken.get_encoding("cl100k_base")
    except Exception:
        encoding = None

    for page in pages:
        page_num = page["page_number"]
        page_text = page["text"]

        if not page_text:
            continue

        paragraphs = page_text.split("\n\n")
        sentences = []
        for p in paragraphs:
            # simple sentence splitting
            p_sentences = p.replace("\n", " ").split(". ")
            for idx, s in enumerate(p_sentences):
                sentence = s.strip()
                if not sentence:
                    continue
                if idx < len(p_sentences) - 1 and not sentence.endswith("."):
                    sentence += "."
                sentences.append(sentence)

        current_chunk_sentences = []
        current_chunk_tokens = 0

        for sentence in sentences:
            sentence_tokens = len(encoding.encode(sentence)) if encoding else len(sentence.split()) * 1.3

            if current_chunk_tokens + sentence_tokens > chunk_size and current_chunk_sentences:
                chunk_text = " ".join(current_chunk_sentences).strip()
                if chunk_text:
                    chunks.append({
                        "chunk_id": str(uuid.uuid4()),
                        "source_file": source_file,
                        "page_number": page_num,
                        "text": chunk_text
                    })

                # Compute overlap
                overlap_sentences = []
                overlap_tokens = 0
                for s in reversed(current_chunk_sentences):
                    s_tokens = len(encoding.encode(s)) if encoding else len(s.split()) * 1.3
                    if overlap_tokens + s_tokens <= chunk_overlap:
                        overlap_sentences.insert(0, s)
                        overlap_tokens += s_tokens
                    else:
                        break

                current_chunk_sentences = overlap_sentences
                current_chunk_tokens = overlap_tokens

            current_chunk_sentences.append(sentence)
            current_chunk_tokens += sentence_tokens

        if current_chunk_sentences:
            chunk_text = " ".join(current_chunk_sentences).strip()
            if chunk_text:
                chunks.append({
                    "chunk_id": str(uuid.uuid4()),
                    "source_file": source_file,
                    "page_number": page_num,
                    "text": chunk_text
                })

    logger.info(f"Generated {len(chunks)} chunks for file '{source_file}'.")
    return chunks
