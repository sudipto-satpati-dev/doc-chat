import time
import logging
from typing import List, Dict, Any
from openai import OpenAI
import google.generativeai as genai
from backend.config import settings

logger = logging.getLogger("rag.generation.llm_client")

def generate_answer(
    system_prompt: str,
    user_prompt: str,
    retrieved_chunks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates grounded answer using Google Gemini API or OpenAI API directly.
    Includes rate-limit rotation across models and automatic retry.
    """
    citations = []
    seen_citations = set()

    for chunk in retrieved_chunks:
        source = chunk.get("source_file", "unknown.pdf")
        page = chunk.get("page_number", 1)
        pair = (source, page)
        if pair not in seen_citations:
            seen_citations.add(pair)
            citations.append({
                "source_file": source,
                "page_number": page,
                "text_snippet": chunk.get("text", "")[:180] + "...",
                "similarity": chunk.get("similarity", 0.0)
            })

    provider = settings.LLM_PROVIDER.lower()

    if provider == "gemini":
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.startswith("your_"):
            raise ValueError("GEMINI_API_KEY is missing in .env file.")

        genai.configure(api_key=api_key)
        
        # Valid active models pool for Gemini API
        model_candidates = [settings.LLM_MODEL, "gemini-2.5-flash", "gemini-3.5-flash", "gemini-flash-latest"]
        unique_models = []
        for m in model_candidates:
            if m not in unique_models:
                unique_models.append(m)

        last_error = None
        response_text = None

        for m_name in unique_models:
            for attempt in range(2):
                try:
                    model = genai.GenerativeModel(
                        model_name=m_name,
                        system_instruction=system_prompt
                    )
                    res = model.generate_content(
                        user_prompt,
                        generation_config=genai.types.GenerationConfig(temperature=0.1)
                    )
                    response_text = res.text
                    break
                except Exception as e:
                    last_error = e
                    err_msg = str(e).lower()
                    if "404" in err_msg or "not found" in err_msg:
                        break # Try next model candidate
                    elif "429" in err_msg or "quota" in err_msg or "rate" in err_msg:
                        logger.warning(f"Model {m_name} hit rate limit (429). Retrying or trying next candidate...")
                        time.sleep(2)
                        continue
                    else:
                        break

            if response_text:
                break

        if not response_text:
            err_str = str(last_error)
            if "429" in err_str or "quota" in err_str.lower():
                raise RuntimeError(
                    "Google Gemini Free Tier Rate Limit Reached (5 Requests/Min). Please wait 30 seconds and try again!"
                )
            raise RuntimeError(f"Google Gemini API Error: {err_str}")

        if "couldn't find information" in response_text.lower() or "unable to find" in response_text.lower():
            if len(retrieved_chunks) == 0 or max([c.get("similarity", 0) for c in retrieved_chunks], default=0) < 0.2:
                citations = []

        return {
            "answer": response_text,
            "citations": citations
        }

    else:
        # OpenAI Provider
        api_key = settings.OPENAI_API_KEY
        if not api_key or api_key.startswith("your_"):
            raise ValueError("OPENAI_API_KEY is missing in .env file.")

        client = OpenAI(api_key=api_key)
        try:
            response = client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1
            )
            answer = response.choices[0].message.content

            if "couldn't find information" in answer.lower() or "unable to find" in answer.lower():
                if len(retrieved_chunks) == 0 or max([c.get("similarity", 0) for c in retrieved_chunks], default=0) < 0.2:
                    citations = []

            return {
                "answer": answer,
                "citations": citations
            }
        except Exception as e:
            logger.error(f"OpenAI LLM API Error: {e}")
            raise RuntimeError(f"OpenAI LLM API Error: {str(e)}")
