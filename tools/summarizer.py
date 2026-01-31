import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def summarize_news_item(news_item):
    """
    Generates summary points and category for a NewsItem using Gemini 1.5 Flash.
    
    Args:
        news_item (dict): The NewsItem to process.
        
    Returns:
        dict: Updated NewsItem with summary_points and category.
    """
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY not found.")
        return news_item

    # Prompt construction
    prompt = f"""
    Jesteś Ekspertem i Analitykiem AI. Przeanalizuj poniższą treść z platformy {news_item['source_platform']} ({news_item['author_or_channel']}).
    
    Tytuł: {news_item['title']}
    Treść: {news_item['raw_content']}
    
    Zadanie:
    1. Wygeneruj 3-5 zwięzłych punktów podsumowujących kluczowe informacje W JĘZYKU POLSKIM.
    2. Skategoryzuj newsa do JEDNEJ z tych kategorii (również po polsku): "Modele LLM", "Generator Wideo", "Produktywność", "Robotyka", "Badania Naukowe", "Wiadomości z Branży", "Inne".
    
    Format wyjściowy JSON:
    {{
        "summary_points": ["punkt 1", "punkt 2", ...],
        "category": "Nazwa Kategorii"
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        
        result = json.loads(response.text)
        
        news_item["summary_points"] = result.get("summary_points", [])
        news_item["category"] = result.get("category", "Uncategorized")
        
        return news_item
        
    except Exception as e:
        print(f"Error summarizing item {news_item.get('title', 'Unknown')}: {e}")
        return news_item

if __name__ == "__main__":
    # Test
    fake_item = {
        "source_platform": "test",
        "author_or_channel": "Test Channel",
        "title": "New AI Model Released",
        "raw_content": "Today we come to you with a new model that achieves 99% on MMLU. It is open weights and available now."
    }
    summarized = summarize_news_item(fake_item)
    print(json.dumps(summarized, indent=2))
