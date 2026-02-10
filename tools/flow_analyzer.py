import json
import os
from typing import Dict, List

import google.generativeai as genai
from dotenv import load_dotenv
from openai import OpenAI

from core.logger import get_logger
from core.settings import GEMINI_API_KEY, OPENAI_API_KEY

load_dotenv()
logger = get_logger(__name__)


class FlowAnalyzer:
    """
    Layer 2: Pain Detector (AI Analysis)
    Analyzes comments for specific customer inquiries indicating manual handling.
    """

    def __init__(self):
        self.gemini_key = GEMINI_API_KEY
        self.openai_key = OPENAI_API_KEY

        self.gemini_model = self._initialize_gemini_model()
        self.openai_client = self._initialize_openai_client()

        if not self.gemini_model and not self.openai_client:
            logger.error("No AI keys found (Gemini or OpenAI). Analysis will be disabled.")

    def _initialize_gemini_model(self):
        if not self.gemini_key:
            return None

        model_candidates = [
            os.getenv("GEMINI_MODEL", "").strip(),
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
        ]

        try:
            genai.configure(api_key=self.gemini_key)
        except Exception as e:
            logger.warning("Failed to configure Gemini: %s", e)
            return None

        for model_name in [m for m in model_candidates if m]:
            try:
                model = genai.GenerativeModel(model_name)
                logger.info("Gemini AI initialized with model=%s", model_name)
                return model
            except Exception as e:
                logger.warning("Failed to initialize Gemini model '%s': %s", model_name, e)

        return None

    def _initialize_openai_client(self):
        if not self.openai_key:
            return None

        try:
            client = OpenAI(api_key=self.openai_key)
            logger.info("OpenAI initialized.")
            return client
        except Exception as e:
            logger.warning("Failed to initialize OpenAI: %s", e)
            return None

    def analyze_comments(self, comments: List[str]) -> Dict:
        """
        Analyzes a list of comments to detect business opportunities (leads).
        Returns a score and categorized signals.
        """
        if not comments:
            return {"pain_score": 0, "signals": []}

        valid_comments = [c for c in comments if len(c) > 5 and len(c) < 500]
        if not valid_comments:
            return {"pain_score": 0, "signals": []}

        comments_text = "\n".join([f"- {c}" for c in valid_comments[:50]])

        prompt = f"""
        Act as a Business Lead Qualifier. Analyze the following social media comments for a business.
        Identify "Pain Signals" (Booking, Pricing, Order, Availability).

        Comments:
        {comments_text}

        Return ONLY a JSON object:
        {{
          "pain_score": 0-10,
          "signals": [{{ "category": "Booking/Pricing/Order/Availability", "text": "comment", "confidence": "high/medium/low" }}],
          "summary": "explanation"
        }}
        """

        if self.gemini_model:
            try:
                response = self.gemini_model.generate_content(prompt)
                text = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(text)
            except Exception as e:
                logger.warning("Gemini analysis failed: %s", e)

        if self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                logger.error("OpenAI analysis also failed: %s", e)

        return {"pain_score": 0, "signals": [], "error": "AI analysis unavailable"}


if __name__ == "__main__":
    analyzer = FlowAnalyzer()

    test_comments = [
        "Wow, ale super paznokcie! 😍",
        "Jaka cena za hybrydę?",
        "Czy macie wolny termin na piątek?",
        "Beautiful work!",
        "Jak się można zapisać? Dzwonię i nikt nie odbiera...",
        "Gdzie to jest?",
    ]

    print("Testing FlowAnalyzer...")
    result = analyzer.analyze_comments(test_comments)
    print(json.dumps(result, indent=2, ensure_ascii=False))
