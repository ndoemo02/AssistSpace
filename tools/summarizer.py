import json
import os
import re
from typing import Any, Dict, List

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

_ALLOWED_CATEGORIES = {
    "Modele LLM",
    "Generator Wideo",
    "Produktywność",
    "Robotyka",
    "Badania Naukowe",
    "Wiadomości z Branży",
    "Inne",
}


def _extract_json_payload(text: str) -> Dict[str, Any]:
    """Try to parse Gemini response as JSON, even when wrapped in markdown fences."""
    candidate = text.strip()

    # Case 1: plain JSON
    try:
        return json.loads(candidate)
    except Exception:
        pass

    # Case 2: fenced JSON: ```json ... ```
    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", candidate)
    if fence_match:
        return json.loads(fence_match.group(1))

    # Case 3: first JSON object in text
    object_match = re.search(r"(\{[\s\S]*\})", candidate)
    if object_match:
        return json.loads(object_match.group(1))

    raise ValueError("Response does not contain valid JSON")


def _fallback_summary(news_item: Dict[str, Any]) -> Dict[str, Any]:
    """Deterministic fallback summary when LLM is unavailable or response is invalid."""
    title = (news_item.get("title") or "Brak tytułu").strip()
    source = news_item.get("source_platform", "źródło")
    author = news_item.get("author_or_channel", "nieznany autor")
    raw = (news_item.get("raw_content") or "").strip()

    if raw:
        normalized = re.sub(r"\s+", " ", raw)
        snippets = [s.strip(" -•\t") for s in re.split(r"[\.!?]\s+", normalized) if s.strip()]
        content_points = snippets[:2]
    else:
        content_points = []

    summary_points: List[str] = [
        f"Źródło: {source}, autor/kanał: {author}.",
        f"Temat: {title}.",
    ]

    for snippet in content_points:
        if len(snippet) > 180:
            snippet = snippet[:177] + "..."
        summary_points.append(snippet)

    if len(summary_points) < 3:
        summary_points.append("Brak pełnej treści do analizy — warto otworzyć oryginalny materiał.")

    news_item["summary_points"] = summary_points[:5]
    if not news_item.get("category") or news_item.get("category") == "Uncategorized":
        news_item["category"] = "Wiadomości z Branży"

    return news_item


def _normalize_result(news_item: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
    points = result.get("summary_points", [])
    if not isinstance(points, list):
        points = []

    cleaned_points = [str(p).strip() for p in points if str(p).strip()]

    category = str(result.get("category", "")).strip()
    if category not in _ALLOWED_CATEGORIES:
        category = "Wiadomości z Branży"

    news_item["summary_points"] = cleaned_points[:5]
    news_item["category"] = category

    if not news_item["summary_points"]:
        return _fallback_summary(news_item)

    return news_item


def summarize_news_item(news_item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates summary points and category for a NewsItem using Gemini.
    Falls back to deterministic summary if API key is missing or parsing fails.
    """
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not found. Using fallback summarization.")
        return _fallback_summary(news_item)

    prompt = f"""
    Jesteś Ekspertem i Analitykiem AI. Przeanalizuj poniższą treść z platformy {news_item.get('source_platform', 'unknown')} ({news_item.get('author_or_channel', 'unknown')}).

    Tytuł: {news_item.get('title', 'Brak tytułu')}
    Treść: {news_item.get('raw_content', '')}

    Zadanie:
    1. Wygeneruj 3-5 zwięzłych punktów podsumowujących kluczowe informacje W JĘZYKU POLSKIM.
    2. Skategoryzuj newsa do JEDNEJ z tych kategorii (również po polsku):
       "Modele LLM", "Generator Wideo", "Produktywność", "Robotyka", "Badania Naukowe", "Wiadomości z Branży", "Inne".

    Zwróć WYŁĄCZNIE JSON w postaci:
    {{
        "summary_points": ["punkt 1", "punkt 2"],
        "category": "Nazwa Kategorii"
    }}
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )

        result = _extract_json_payload(response.text)
        return _normalize_result(news_item, result)

    except Exception as e:
        print(f"Error summarizing item {news_item.get('title', 'Unknown')}: {e}. Using fallback.")
        return _fallback_summary(news_item)


if __name__ == "__main__":
    fake_item = {
        "source_platform": "test",
        "author_or_channel": "Test Channel",
        "title": "New AI Model Released",
        "raw_content": "Today we come to you with a new model that achieves 99% on MMLU. It is open weights and available now.",
    }
    summarized = summarize_news_item(fake_item)
    print(json.dumps(summarized, indent=2, ensure_ascii=False))
