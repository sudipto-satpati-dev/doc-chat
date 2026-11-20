from typing import List, Dict, Any

SYSTEM_PROMPT = """You are Corpus, an expert AI Document Analysis Assistant.
Your job is to answer user questions using ONLY the provided document passages below.

STRICT GROUNDING RULES:
1. Base your answer strictly on the provided context passages. Do not hallucinate or use external prior knowledge.
2. If the context does not contain enough information to answer the question, clearly state: "I'm sorry, but I couldn't find information regarding this in the uploaded PDF documents."
3. Always cite the document name and page number for facts you reference (e.g. [refund_policy.pdf, Page 3]).
4. Provide structured, clean, and helpful answers using markdown formatting (bullet points, bold highlights, concise sections).
"""

def build_prompt(
    query: str,
    chunks: List[Dict[str, Any]],
    chat_history: List[Dict[str, str]] = None
) -> tuple[str, str]:
    """
    Builds (system_message, user_message) pair for LLM call.
    """
    if not chunks:
        context_str = "No relevant document passages found in the knowledge base."
    else:
        formatted_passages = []
        for idx, chunk in enumerate(chunks, 1):
            source = chunk.get("source_file", "unknown.pdf")
            page = chunk.get("page_number", 1)
            text = chunk.get("text", "")
            sim = chunk.get("similarity", 0.0)
            formatted_passages.append(
                f"--- PASSAGE {idx} [Document: {source} | Page: {page} | Similarity: {sim}] ---\n{text}"
            )
        context_str = "\n\n".join(formatted_passages)

    history_str = ""
    if chat_history:
        recent = chat_history[-6:]  # Keep last 3 turns
        hist_lines = []
        for msg in recent:
            role = "User" if msg["role"] == "user" else "Assistant"
            hist_lines.append(f"{role}: {msg['content']}")
        history_str = "RECENT CHAT HISTORY:\n" + "\n".join(hist_lines) + "\n\n"

    user_message = f"""{history_str}CONTEXT PASSAGES FROM UPLOADED DOCUMENTS:
{context_str}

USER QUESTION:
{query}

Please answer the user question strictly based on the context passages above and cite your sources."""

    return SYSTEM_PROMPT, user_message
