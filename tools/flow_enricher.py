import logging
import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FlowEnricher:
    """
    Layer 3: Business Enrichment
    Checks for presence of modern tools (website, booking links, etc.).
    """
    
    def enrich_profile(self, profile_data: Dict) -> Dict:
        """
        Enriches a lead profile with automation gap analysis.
        Returns score (0-10, where 10 = massive gap/opportunity).
        """
        gap_score = 0
        gap_details = []
        
        # 1. Check Bio Link
        bio_link = profile_data.get("bio_link") or profile_data.get("externalUrl")
        
        if not bio_link:
            gap_score += 5
            gap_details.append("No bio link found")
        else:
            # Analyze link target
            if "linktr.ee" in bio_link or "beacons.ai" in bio_link:
                 gap_score += 2
                 gap_details.append("Generic link tree (check if booking inside)")
                 # TODO: Deep check linktree for booking buttons?
            elif "booksy" in bio_link or "calendly" in bio_link or "vagaro" in bio_link:
                 gap_score -= 5
                 gap_details.append("Has booking system (Low potential)")
            else:
                 # Check custom website
                 try:
                     self._analyze_website(bio_link, gap_details)
                 except Exception as e:
                     logger.warning(f"Could not analyze website {bio_link}: {e}")
        
        # 2. Check Contact Options
        # If scraper provides email/phone, good. If missing, might be gap.
        
        return {
            "automation_gap_score": min(gap_score, 10),
            "gap_details": gap_details
        }

    def _analyze_website(self, url: str, details: list):
        """
        Simple check of the website for keywords like "Book Now", "Order Online".
        """
        try:
             response = requests.get(url, timeout=5)
             if response.status_code == 200:
                 soup = BeautifulSoup(response.text, 'html.parser')
                 text = soup.get_text().lower()
                 
                 if "book now" in text or "rezerwacja" in text or "umów" in text:
                      details.append("Website has booking keywords")
                      # Score neutral or slightly negative for our sales pitch?
                 else:
                      details.append("Website seems informational only (No booking CTA found)")
                      # Slight score bump
        except:
             details.append("Website unreachable or error")

if __name__ == "__main__":
    enricher = FlowEnricher()
    
    test_profile = {
        "username": "super_salon",
        "bio_link": "https://example.com" # Mock
    }
    
    print("Testing FlowEnricher...")
    # Mocking _analyze_website for test
    enricher._analyze_website = lambda url, det: det.append("Mock website analysis: No booking found")
    
    result = enricher.enrich_profile(test_profile)
    print(result)
