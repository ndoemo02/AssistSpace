import feedparser
from datetime import datetime
import uuid
import json

def fetch_reddit_rss(subreddits):
    """
    Fetches and parses RSS feeds from a list of subreddits.
    
    Args:
        subreddits (list): List of subreddit names (e.g., ['Authentication', 'OpenAI'])
        
    Returns:
        list: List of NewsItem dictionaries.
    """
    news_items = []
    
    for sub in subreddits:
        rss_url = f"https://www.reddit.com/r/{sub}/.rss"
        try:
            print(f"Fetching RSS for: {sub}")
            feed = feedparser.parse(rss_url)
            
            if feed.bozo:
                print(f"Error parsing feed for {sub}: {feed.bozo_exception}")
                continue
                
            for entry in feed.entries:
                # Basic filtering or processing could go here
                
                # Create NewsItem structure
                item = {
                    "id": str(uuid.uuid4()),
                    "source_platform": "reddit",
                    "title": entry.title if 'title' in entry else "No Title",
                    "url": entry.link if 'link' in entry else "",
                    "published_at": _parse_date(entry),
                    "summary_points": [], # To be filled by summarizer
                    "category": "Uncategorized", # To be filled by classifier/summarizer
                    "author_or_channel": entry.author if 'author' in entry else f"r/{sub}",
                    "raw_content": entry.description if 'description' in entry else ""
                }
                news_items.append(item)
                
        except Exception as e:
            print(f"Critical error fetching {sub}: {e}")
            
    return news_items

def _parse_date(entry):
    """Helper to handle various RSS date formats or return ISO now."""
    # Reddit RSS usually has 'updated' or 'published'
    if 'updated' in entry:
        return entry.updated
    if 'published' in entry:
        return entry.published
    return datetime.utcnow().isoformat()

if __name__ == "__main__":
    # Test run
    subs = ["ArtificialInteligence", "OpenAI", "MachineLearning"]
    items = fetch_reddit_rss(subs)
    print(json.dumps(items[:2], indent=2))
    print(f"Total items fetched: {len(items)}")
