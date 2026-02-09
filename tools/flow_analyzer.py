import os
import logging
import google.generativeai as genai
from openai import OpenAI
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FlowAnalyzer:
    """
    Layer 2: Pain Detector (AI Analysis)
    Analyzes comments for specific customer inquiries indicating manual handling.
    """
    
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        
        # Initialize Gemini
        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
                logger.info("Gemini AI initialized.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini: {e}")
                self.gemini_model = None
        else:
            self.gemini_model = None

        # Initialize OpenAI
        if self.openai_key:
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
                logger.info("OpenAI initialized.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI: {e}")
                self.openai_client = None
        else:
            self.openai_client = None

        if not self.gemini_model and not self.openai_client:
            logger.error("No AI keys found (Gemini or OpenAI). Analysis will be disabled.")

    def analyze_comments(self, comments: List[str]) -> Dict:
        """
        Analyzes a list of comments to detect business opportunities (leads).
        Returns a score and categorized signals.
        """
        if not comments:
            return {"pain_score": 0, "signals": []}

        # prompt engineering
        valid_comments = [c for c in comments if len(c) > 5 and len(c) < 500]
        if not valid_comments:
             return {"pain_score": 0, "signals": []}

        comments_text = "\n".join([f"- {c}" for c in valid_comments[:50]]) # Limit to 50 comments
        
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

        import json

        # 1. Try Gemini
        if self.gemini_model:
            try:
                response = self.gemini_model.generate_content(prompt)
                text = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(text)
            except Exception as e:
                logger.warning(f"Gemini analysis failed: {e}")

        # 2. Try OpenAI Fallback
        if self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={ "type": "json_object" }
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                logger.error(f"OpenAI analysis also failed: {e}")
        
        return {"pain_score": 0, "signals": [], "error": "AI analysis unavailable"}

if __name__ == "__main__":
    # Test execution
    analyzer = FlowAnalyzer()
    
    test_comments = [
        "Wow, ale super paznokcie! 😍",
        "Jaka cena za hybrydę?",
        "Czy macie wolny termin na piątek?",
        "Beautiful work!",
        "Jak się można zapisać? Dzwonię i nikt nie odbiera...",
        "Gdzie to jest?"
    ]
    
    print("Testing FlowAnalyzer...")
    result = analyzer.analyze_comments(test_comments)
    import json
    print(json.dumps(result, indent=2, ensure_ascii=False))
