import argparse
import sys
import json
import concurrent.futures
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Import Tools
try:
    from tools.scraper_rss import fetch_reddit_rss
    from tools.scraper_youtube import fetch_youtube_videos
    from tools.scraper_github import fetch_github_trending
    from tools.summarizer import summarize_news_item
    from tools.db_client import save_news_items, get_supabase_client
    
    # New FlowAssist Tools
    from tools.flow_collector import FlowCollector
    from tools.flow_analyzer import FlowAnalyzer
    from tools.flow_enricher import FlowEnricher
    from tools.flow_scorer import FlowScorer
    
except ImportError as e:
    print(f"Error importing tools. {e}")
    sys.exit(1)

def get_news_sources():
    client = get_supabase_client()
    # Defaults
    default_subs = ["ArtificialInteligence", "OpenAI", "MachineLearning"]
    default_yt = ["UCbfYPyITQ-7l4upoX8nvctg", "UC5_6mG17t5_tXyE6s_6E7uQ"] # Two Minute Papers, Fireship
    default_gh = [] # GitHub has its own trending fallback

    if not client: 
        return default_subs, default_yt, default_gh
        
    try:
        response = client.table("sources").select("*").eq("active", True).execute()
        data = response.data
        subs = [s['identifier'] for s in data if s['platform'] == 'reddit']
        yt_channels = [s['identifier'] for s in data if s['platform'] == 'youtube']
        gh_repos = [s['identifier'] for s in data if s['platform'] == 'github']
        
        # Merge or fallback
        final_subs = subs if subs else default_subs
        final_yt = yt_channels if yt_channels else default_yt
        
        return final_subs, final_yt, gh_repos
    except Exception as e:
        print(f"Error fetching sources from DB: {e}. Using defaults.")
        return default_subs, default_yt, default_gh

def run_news_aggregator(dry_run=False):
    print("--- AI News Agent Started ---")
    subreddits, youtube_channels, gh_repos = get_news_sources()
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_reddit = executor.submit(fetch_reddit_rss, subreddits)
        future_youtube = executor.submit(fetch_youtube_videos, youtube_channels, max_results=10)
        future_github = executor.submit(fetch_github_trending, gh_repos)
        
        items = future_reddit.result() + future_youtube.result() + future_github.result()
        
    print(f"Fetched {len(items)} items ({len(future_github.result())} from GitHub).")
    if not items: return

    print("Summarizing...")
    processed_items = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_item = {executor.submit(summarize_news_item, item): item for item in items}
        for future in concurrent.futures.as_completed(future_to_item):
            try: processed_items.append(future.result())
            except: pass

    if dry_run:
        print(json.dumps(processed_items[:2], indent=2, default=str))
    else:
        save_news_items(processed_items)
        print(f"Saved {len(processed_items)} items.")

def run_flow_lead_gen(niche: str, location: str = None, sources: list = ["instagram"], dry_run=False):
    """
    Executes the 4-layer FlowAssist Lead Generation Pipeline.
    """
    print(f"--- FlowAssist Lead Gen Started for niche: {niche} ---")
    if location:
        print(f"Targeting Location: {location}")
    print(f"Sources: {', '.join(sources)}")
    
    # 1. Collector
    collector = FlowCollector()
    all_leads = []
    
    if "instagram" in sources:
        print(f"Layer 1: Collecting leads from Instagram for #{niche}...")
        # If location is provided, try to search for niche+location as a hashtag too
        hashtags = [niche]
        if location:
            # Simple heuristic: #paznokciewarszawa
            # Remove spaces from location
            loc_clean = location.replace(" ", "").lower()
            hashtags.append(f"{niche}{loc_clean}")
            print(f"Added location-based hashtag: #{hashtags[-1]}")
            
        ig_leads = collector.collect_instagram_leads(hashtags, max_posts=10)
        
        if not ig_leads:
             print("Apify returned 0 Instagram leads. Attempting Browser Falback (Playwright)...")
             print("NOTE: A browser window will open. If you see a Login page, please log in manually!")
             ig_leads = collector.collect_instagram_browser(hashtags, max_posts=5)
             
        all_leads.extend(ig_leads)

    if "tiktok" in sources:
        print(f"Layer 1: Collecting leads from TikTok for #{niche}...")
        tt_leads = collector.collect_tiktok_leads([niche], max_videos=5)
        all_leads.extend(tt_leads)

    if "facebook" in sources:
        print(f"Layer 1: Collecting leads from Facebook for {niche}...")
        # For Facebook we use niche + location as search query
        keywords = [niche]
        if location:
            keywords.append(f"{niche} {location}")
        
        fb_leads = collector.collect_facebook_leads(keywords, max_posts=5)
        all_leads.extend(fb_leads)
    
    print(f"Found {len(all_leads)} candidates.")
    
    # 2 & 3 & 4. Analysis Loop
    analyzer = FlowAnalyzer()
    enricher = FlowEnricher()
    scorer = FlowScorer()
    
    hot_leads = []
    
    print("Layers 2-4: Analyzing, Enriching, Scoring...")
    for lead in all_leads:
        # A. Analyzer (Pain Detector)
        # Construct comments_text starting with caption (business context)
        comments_text = [lead.get('caption', '')] if lead.get('caption') else []
        
        comments = lead.get("comments", [])
        if comments:
             # Extract text from comments if they are dicts
             if isinstance(comments[0], dict):
                 comments_text.extend([c.get("text", "") for c in comments])
             else:
                 comments_text.extend(comments)
                 
        if comments_text:
             analysis = analyzer.analyze_comments(comments_text)
             lead.update(analysis) # adds pain_score, signals
        else:
             lead["pain_score"] = 0
             lead["signals"] = []
             
        # B. Enricher (Business Check)
        # Using owner username to construct a profile object for enrichment
        profile_data = {
            "username": lead.get("owner_username"),
            "bio_link": "", 
        }
        enrichment = enricher.enrich_profile(profile_data)
        lead.update(enrichment)
        
        # C. Scorer
        score_result = scorer.calculate_lead_score(lead)
        lead["flow_score"] = score_result
        
        print(f"Lead: {lead.get('owner_username')} | Score: {score_result['score']} ({score_result['priority']})")
        
        if score_result['score'] >= 10: # Lowered threshold for demo visibility
            lead["score_val"] = score_result['score'] # Ensure key matches save_leads expectation
            hot_leads.append(lead)

    # Output
    print(f"\n--- Result: {len(hot_leads)} Hot/Warm Leads ---")
    if dry_run:
        print(json.dumps(hot_leads, indent=2, default=str))
    else:
        # Save to DB
        if hot_leads:
            from tools.db_client import save_leads
            result = save_leads(hot_leads)
            print(f"Leads saved to Supabase. Count: {result.get('count')}")
        else:
            print("No hot/warm leads to save.")

def main():
    parser = argparse.ArgumentParser(description="AssistSpace Agent")
    parser.add_argument("--mode", type=str, default="news", choices=["news", "flow-lead-gen"], help="Operation mode")
    parser.add_argument("--niche", type=str, help="Hashtag/Niche for Lead Gen (without #)")
    parser.add_argument("--location", type=str, help="Target city/location (e.g. 'warszawa')")
    parser.add_argument("--sources", type=str, nargs="+", default=["instagram"], choices=["instagram", "tiktok", "facebook"], help="Data sources")
    parser.add_argument("--dry-run", action="store_true", help="Skip DB save")
    args = parser.parse_args()

    if args.mode == "flow-lead-gen":
        if not args.niche:
            print("Error: --niche is required for flow-lead-gen mode")
            return
        run_flow_lead_gen(args.niche, args.location, args.sources, args.dry_run)
    else:
        run_news_aggregator(args.dry_run)

if __name__ == "__main__":
    main()
