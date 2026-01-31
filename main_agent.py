import argparse
import sys
import json
import concurrent.futures
from datetime import datetime

# Import Tools
try:
    from tools.scraper_rss import fetch_reddit_rss
    from tools.scraper_youtube import fetch_youtube_videos
    from tools.summarizer import summarize_news_item
    from tools.db_client import save_news_items
except ImportError as e:
    print(f"Error importing tools. Make sure you are running from project root. {e}")
    sys.exit(1)

# Fetch Sources from DB
from tools.db_client import get_supabase_client

def get_active_sources():
    client = get_supabase_client()
    if not client:
        print("DB Connection failed. Using defaults.")
        return [], []
    
    try:
        response = client.table("sources").select("*").eq("active", True).execute()
        data = response.data
        
        subs = [s['identifier'] for s in data if s['platform'] == 'reddit']
        yt_channels = [s['identifier'] for s in data if s['platform'] == 'youtube']
        
        if not subs and not yt_channels:
            print("No active sources found in DB. Using defaults.")
            raise Exception("Empty DB")
            
        print(f"Loaded {len(subs)} subreddits and {len(yt_channels)} YT channels from DB.")
        return subs, yt_channels
    except Exception as e:
        print(f"Error fetching sources: {e}")
        # Defaults
        return ["ArtificialInteligence", "OpenAI", "MachineLearning"], \
               ["UCbfYPyITQ-7l4upoX8nvctg", "UC7e1y3j0-a0t_qZl4-6j29A", "UCNJ1YreU-n91U-7p7r72t7A"]

SUBREDDITS, YOUTUBE_CHANNELS = get_active_sources()

def main():
    parser = argparse.ArgumentParser(description="AI News Aggregator Agent")
    parser.add_argument("--dry-run", action="store_true", help="Skip DB save and print JSON to console")
    args = parser.parse_args()

    print(f"--- AI News Agent Started at {datetime.now().isoformat()} ---")
    
    all_items = []
    
    # 1. Scraping (Parallel)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_reddit = executor.submit(fetch_reddit_rss, SUBREDDITS)
        future_youtube = executor.submit(fetch_youtube_videos, YOUTUBE_CHANNELS, max_results=10)
        
        # Wait for results
        reddit_items = future_reddit.result()
        youtube_items = future_youtube.result()
        
    print(f"Fetched {len(reddit_items)} items from Reddit.")
    print(f"Fetched {len(youtube_items)} items from YouTube.")
    
    all_items.extend(reddit_items)
    all_items.extend(youtube_items)
    
    if not all_items:
        print("No items found. Exiting.")
        return

    # 2. Summarization & Classification (Sequential for now to easy debug, parallel later?)
    # Generating summaries takes time. Let's do parallel for speed.
    print("Starting Summarization & Classification...")
    processed_items = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # submit all tasks
        future_to_item = {executor.submit(summarize_news_item, item): item for item in all_items}
        
        for future in concurrent.futures.as_completed(future_to_item):
            try:
                processed_item = future.result()
                processed_items.append(processed_item)
                # Simple progress indicator
                print(".", end="", flush=True)
            except Exception as e:
                print(f"x", end="", flush=True)
    
    print(f"\nProcessed {len(processed_items)} items.")

    # 3. Save or Output
    if args.dry_run:
        print("\n--- DRY RUN MODE: Outputting JSON ---")
        print(json.dumps(processed_items, indent=2, default=str))
        print("--- End JSON ---")
    else:
        print("Saving to Database...")
        result = save_news_items(processed_items)
        if result["success"]:
            print(f"SUCCESS: Saved {result['count']} items to Supabase.")
        else:
            print(f"FAILURE: DB Error: {result.get('error')}")
            # Fallback output
            print("Fallback JSON Output:")
            print(json.dumps(processed_items[:2], indent=2, default=str))

if __name__ == "__main__":
    main()
