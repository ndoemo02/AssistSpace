import os
from typing import Iterable, Optional


def get_first_env(keys: Iterable[str], default: Optional[str] = None) -> Optional[str]:
    """Return first non-empty environment variable from provided keys."""
    for key in keys:
        value = os.getenv(key)
        if value and value.strip():
            return value.strip()
    return default


GEMINI_API_KEY = get_first_env(["GEMINI_API_KEY", "GOOGLE_API_KEY", "VITE_GEMINI_API_KEY"])
OPENAI_API_KEY = get_first_env(["OPENAI_API_KEY", "VITE_OPENAI_API_KEY"])
