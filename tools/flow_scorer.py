import logging
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FlowScorer:
    """
    Layer 4: Lead Scoring (tu się robi kasa)
    Score = (Engagement velocity * 0.3) + (Pain signals frequency * 0.5) + (Automation gap * 0.2)
    """

    def calculate_lead_score(self, lead_data: Dict) -> Dict:
        """
        Calculates final score (0-100) and priority level.
        Input `lead_data` contains output from Analyzer and Enricher.
        """
        
        # 1. Engagement Velocity (Mock based on raw likes/comments)
        # Assuming higher engagement implies higher lead potential (more busy -> more pain)
        engagement = lead_data.get("likes_count", 0) + lead_data.get("comments_count", 0) * 2
        engagement_score = min(engagement / 100, 10) # Cap at 10
        
        # 2. Pain Signals Frequency
        pain_score = lead_data.get("pain_score", 0) # Already 0-10 from Gemini
        
        # 3. Automation Gap
        gap_score = lead_data.get("automation_gap_score", 0) # 0-10 from Enricher
        
        # Weighted Final Score (0-100 scale)
        # Weights: Pain=50%, Engagement=30%, Gap=20%
        # (10 * 0.5 + 10 * 0.3 + 10 * 0.2) * 10 = 100
        
        final_score = (pain_score * 5) + (engagement_score * 3) + (gap_score * 2)
        final_score = min(max(final_score, 0), 100)
        
        priority = "LOW"
        if final_score > 75:
            priority = "🔥 HOT"
        elif final_score > 50:
            priority = "⚠️ WARM"
            
        return {
            "score": round(final_score, 1),
            "priority": priority,
            "breakdown": {
                "pain": pain_score,
                "engagement": engagement_score,
                "gap": gap_score
            }
        }

if __name__ == "__main__":
    scorer = FlowScorer()
    
    test_lead = {
        "likes_count": 500, # High engagement -> +5 pts (max 10)
        "comments_count": 50,
        "pain_score": 8,    # Lots of "how to book?" -> +40 pts
        "automation_gap_score": 5 # No booking link -> +10 pts
    }
    # Expected: (8*5) + (5*3) + (5*2) = 40 + 15 + 10 = 65 (Warm)
    
    print("Testing FlowScorer...")
    result = scorer.calculate_lead_score(test_lead)
    print(result)
