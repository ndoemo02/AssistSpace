import os
import logging
import nest_asyncio
nest_asyncio.apply()
from apify_client import ApifyClient
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FlowCollector:
    """
    Layer 1: Video / Social Signal Collector
    Fetches content from social media platforms using Apify actors.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("APIFY_API_KEY")
        if not self.api_key:
            logger.warning("APIFY_API_KEY not found in environment variables. Apify calls will fail.")
            self.client = None
        else:
            self.client = ApifyClient(self.api_key)
            
    def collect_instagram_leads(self, hashtags: List[str], max_posts: int = 20, max_comments: int = 50) -> List[Dict]:
        """
        Collects Instagram posts and their comments for given hashtags.
        Uses Apify's 'apify/instagram-scraper' or similar.
        """
        if not self.client:
            logger.error("Apify client not initialized.")
            return []
            
        all_leads = []
        
        # Deduplicate hashtags to avoid redundant work
        hashtags = list(set(hashtags))
        
        for hashtag in hashtags:
            logger.info(f"Scraping Instagram for hashtag: #{hashtag}")
            
            # Run the Actor
            # utilizing 'apify/instagram-hashtag-scraper'
            run_input = {
                "hashtags": [hashtag],
                "resultsLimit": max_posts,
            }
            
            try:
                # 'apify/instagram-hashtag-scraper'
                run = self.client.actor("apify/instagram-hashtag-scraper").call(run_input=run_input)
                
                if not run:
                    logger.error("Apify run failed to start.")
                    continue

                logger.info(f"Apify run finished. Fetching results from dataset {run['defaultDatasetId']}...")
                
                # Fetch results
                dataset_items = self.client.dataset(run["defaultDatasetId"]).list_items().items
                
                if not dataset_items:
                    logger.warning(f"No items found for #{hashtag}")

                for item in dataset_items:
                    # Transform to our standard format
                    lead_candidate = {
                        "platform": "instagram",
                        "source_id": item.get("id"),
                        "url": item.get("url"),
                        "caption": item.get("caption"),
                        "owner_username": item.get("ownerUsername"),
                        "likes_count": item.get("likesCount", 0),
                        "comments_count": item.get("commentsCount", 0),
                        "timestamp": item.get("timestamp"),
                        "comments": [],  # We might need a separate call for comments if not included
                        "raw_data": item # Keep raw data for debugging/enrichment
                    }
                    
                    # If high engagement, fetch comments (if not present)
                    # Some scrapers include latest comments.
                    if item.get("latestComments"):
                         lead_candidate["comments"] = item["latestComments"]
                    elif lead_candidate["comments_count"] > 0 and len(all_leads) < 10: # Increased limit
                         # Fetch comments for top 10 posts only to save credits
                         # Use scrapesmith/instagram-free-comments-scraper
                         try:
                             comments = self.get_comments(lead_candidate["url"], max_comments=20)
                             lead_candidate["comments"] = comments
                         except Exception as xc:
                             logger.warning(f"Failed to fetch comments for {lead_candidate['url']}: {xc}")
                         
                    all_leads.append(lead_candidate)
                    
            except Exception as e:
                logger.error(f"Error scraping Instagram for {hashtag}: {e}")
                
        return all_leads

    def get_comments(self, post_url: str, max_comments: int = 20) -> List[Dict]:
        """
        Fetches comments for a specific Instagram post.
        """
        if not self.client: return []
        
        logger.info(f"Fetching comments for {post_url}...")
        try:
             # 'apify/instagram-comments-scraper' (or similar)
             run_input = {
                 "directUrls": [post_url],
                 "resultsLimit": max_comments,
             }
             run = self.client.actor("scrapesmith/instagram-free-comments-scraper").call(run_input=run_input)
             
             if not run: return []
             
             items = self.client.dataset(run["defaultDatasetId"]).list_items().items
             comments = []
             for item in items:
                 comments.append({
                     "text": item.get("text"),
                     "owner": item.get("ownerUsername"),
                     "likes": item.get("likesCount", 0),
                     "timestamp": item.get("timestamp")
                 })
             return comments
        except Exception as e:
            logger.error(f"Error fetching comments for {post_url}: {e}")
            return []

    def collect_facebook_leads(self, keywords: List[str], max_posts: int = 10) -> List[Dict]:
        """
        Collects Facebook posts/groups content. 
        Note: Facebook scraping is notoriously difficult. Using 'apify/facebook-search-scraper'
        """
        if not self.client:
             logger.error("Apify client not initialized.")
             return []

        all_leads = []
        for keyword in keywords:
            logger.info(f"Scraping Facebook for: {keyword}")
            # Basic input for a search scraper. Adjust based on specific actor.
            run_input = {
                "startUrls": [{"url": f"https://www.facebook.com/search/posts?q={keyword}"}],
                "resultsLimit": max_posts,
            }
            # Alternatively use a dedicated group scraper if we had group URLs
            
            try:
                # Using a generic facebook search actor if available, or pages scraper.
                # For this demo, let's assume 'apify/facebook-posts-scraper' or similar works with search URLs
                # Ideally, we'd use 'apify/facebook-search-scraper'
                run = self.client.actor("apify/facebook-posts-scraper").call(run_input=run_input)
                
                if not run: continue
                
                dataset_items = self.client.dataset(run["defaultDatasetId"]).list_items().items
                for item in dataset_items:
                     lead = {
                        "platform": "facebook",
                        "source_id": item.get("id"),
                        "url": item.get("url"),
                        "caption": item.get("text"),
                        "owner_username": item.get("user", {}).get("name"),
                        "likes_count": item.get("likes", 0),
                        "comments_count": item.get("comments", 0),
                        "timestamp": item.get("time"),
                        "raw_data": item
                     }
                     all_leads.append(lead)
            except Exception as e:
                logger.error(f"Error scraping Facebook for {keyword}: {e}")
        
        return all_leads

    def collect_tiktok_leads(self, hashtags: List[str], max_videos: int = 20) -> List[Dict]:
        """
        Collects TikTok videos and metadata.
        """
        if not self.client:
             logger.error("Apify client not initialized.")
             return []

        all_leads = []
        
        for hashtag in hashtags:
            logger.info(f"Scraping TikTok for hashtag: #{hashtag}")
            
            run_input = {
                "hashtags": [hashtag],
                "resultsPerPage": max_videos,
                "shouldDownloadVideos": False,
                "shouldDownloadCovers": False,
                "shouldDownloadSlideshowImages": False,
            }
            
            try:
                # 'apify/tiktok-scraper'
                run = self.client.actor("clockworks/tiktok-scraper").call(run_input=run_input)
                 
                if not run:
                    continue
                    
                logger.info(f"Apify run finished. Fetching results...")
                dataset_items = self.client.dataset(run["defaultDatasetId"]).list_items().items
                
                for item in dataset_items:
                    lead_candidate = {
                        "platform": "tiktok",
                        "source_id": item.get("id"),
                        "url": item.get("webVideoUrl"),
                        "caption": item.get("text"),
                        "owner_username": item.get("authorMeta", {}).get("name"),
                        "likes_count": item.get("diggCount", 0),
                        "comments_count": item.get("commentCount", 0),
                        "timestamp": item.get("createTime"),
                         "raw_data": item
                    }
                    all_leads.append(lead_candidate)
                    
            except Exception as e:
                logger.error(f"Error scraping TikTok for {hashtag}: {e}")
                
        return all_leads

    def collect_instagram_browser(self, hashtags: List[str], max_posts: int = 10) -> List[Dict]:
        """
        Collects Instagram posts using a local browser (Playwright) to bypass API limitations.
        Requires 'playwright' and 'chromium' installed.
        """
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            logger.error("Playwright not installed. Run 'pip install playwright && python -m playwright install chromium'")
            return []
            
        all_leads = []
        user_data_dir = os.path.abspath(os.path.join(os.getcwd(), "browser_profile"))
        
        if not os.path.exists(user_data_dir):
            os.makedirs(user_data_dir, exist_ok=True)
            
        with sync_playwright() as p:
            print("Playwright context manager entered.")
            # Launch browser with persistence
            try:
                print(f"Launching persistent context in: {user_data_dir}")
                browser = p.chromium.launch_persistent_context(
                    user_data_dir,
                    headless=False,
                    args=["--disable-blink-features=AutomationControlled"] 
                )
                print("Browser launched successfully.")
            except Exception as e:
                print(f"FAILED TO LAUNCH BROWSER: {e}")
                return []
            
            page = browser.new_page()
            print("New page context created.")
            
            for hashtag in hashtags:
                logger.info(f"Browser scraping Instagram for #{hashtag}...")
                try:
                    logger.info(f"Navigating to {hashtag} page...")
                    page.goto(f"https://www.instagram.com/explore/tags/{hashtag}/", timeout=60000)
                    logger.info(f"Current URL: {page.url}")
                    
                    # 1. Handle Cookie Consent (IG or FB)
                    def handle_cookies(p):
                        selectors = [
                            "button:has-text('Zezwól na wszystkie pliki cookie')",
                            "button:has-text('Allow all cookies')",
                            "button:has-text('Zezwól')",
                            "button:has-text('Allow')",
                            "button._a9--._ap36._asz1",
                            "button[data-testid='cookie-policy-manage-dialog-accept-button']"
                        ]
                        for selector in selectors:
                            try:
                                btn = p.locator(selector).first
                                if btn.count() > 0:
                                    logger.info(f"Cookie banner detected: {selector}. Clicking...")
                                    btn.click()
                                    p.wait_for_timeout(2000)
                            except:
                                continue

                    handle_cookies(page)

                    # 2. Check for login wall
                    is_login_page = False
                    if "login" in page.url or page.locator("input[name='username']").count() > 0:
                        is_login_page = True
                    
                    if not is_login_page:
                        content = page.content().lower()
                        if "zaloguj" in content or "log in" in content:
                            if page.locator("button:has-text('Zaloguj się'), button:has-text('Log In')").count() > 0:
                                is_login_page = True

                    if is_login_page:
                        logger.info("Instagram Login wall detected. Attempting automated entry...")
                        
                        # Try Log in with Facebook
                        fb_selectors = [
                            "button:has-text('Zaloguj się przez Facebooka')",
                            "span:has-text('Zaloguj się przez Facebooka')",
                            "button:has-text('Log in with Facebook')",
                            ".fd33f"
                        ]
                        
                        for selector in fb_selectors:
                            try:
                                fb_btn = page.locator(selector).first
                                if fb_btn.count() > 0:
                                    logger.info(f"Clicking FB Login with: {selector}")
                                    fb_btn.click()
                                    page.wait_for_timeout(5000)
                                    handle_cookies(page) # Handle FB cookies
                                    
                                    # Check for "Continue as..." button on FB
                                    continue_selectors = ["button:has-text('Kontynuuj jako')", "button:has-text('Continue as')"]
                                    for c_sel in continue_selectors:
                                        c_btn = page.locator(c_sel).first
                                        if c_btn.count() > 0:
                                            logger.info(f"Confirmed FB session: Clicking {c_sel}")
                                            c_btn.click()
                                            page.wait_for_timeout(5000)
                                            break
                                    break
                            except:
                                continue

                        # Final check for login status
                        if "login" in page.url or "facebook.com" in page.url or page.locator("input[name='username']").count() > 0:
                            logger.warning("Automated login incomplete. WAITING for manual user action.")
                            print("\n" + "!"*64)
                            print("❗ WYMAGANE RĘCZNE ZALICZENIE LOGOWANIA ❗")
                            print("W oknie przeglądarki kliknij 'Zaloguj przez FB' lub wpisz dane.")
                            print("Po zalogowaniu system sam wykryje zmianę strony i ruszy dalej.")
                            print("!"*64 + "\n")
                            
                            # Wait up to 120s for user to finish login
                            for _ in range(24):
                                page.wait_for_timeout(5000)
                                if "instagram.com" in page.url and "login" not in page.url:
                                    logger.info("Success! User logged in. Returning to scraping...")
                                    break
                            
                            # Re-navigate to the actual target page
                            page.goto(f"https://www.instagram.com/explore/tags/{hashtag}/", timeout=60000)
                            page.wait_for_load_state("networkidle")

                    # 3. Scrape posts
                    logger.info(f"Scanning posts on page: {page.url}")
                    try:
                        page.wait_for_selector("a[href*='/p/']", timeout=15000)
                    except:
                        logger.warning("No posts detected in grid. Refreshing...")
                        page.reload()
                        page.wait_for_timeout(5000)
                    
                    # Scroll to load content
                    for _ in range(3):
                        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        page.wait_for_timeout(2000)
                    
                    # Extract posts
                    # Selectors for post links in the grid
                    post_links = page.locator("a[href*='/p/']").all()
                    logger.info(f"Found {len(post_links)} potential posts.")
                    
                    if len(post_links) == 0:
                        # Debug screenshot
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        screenshot_path = f"debug_ig_{hashtag}_{timestamp}.png"
                        page.screenshot(path=screenshot_path)
                        logger.warning(f"No posts found! Saved debug screenshot to {screenshot_path}")
                    
                    count = 0
                    for link in post_links:
                        if count >= max_posts: break
                        
                        try:
                            url = link.get_attribute("href")
                            if not url or "/p/" not in url: continue
                            
                            full_url = f"https://www.instagram.com{url}"
                            
                            # Try to get caption from image alt text
                            caption = ""
                            img = link.locator("img").first
                            if img.count() > 0:
                                alt_text = img.get_attribute("alt")
                                if alt_text:
                                    caption = alt_text
                            
                            lead = {
                                "platform": "instagram",
                                "source_id": url.split("/p/")[1].replace("/", ""),
                                "url": full_url,
                                "caption": caption or f"Post from #{hashtag}",
                                "owner_username": "hidden", 
                                "likes_count": 0,
                                "comments_count": 0,
                                "timestamp": datetime.now().isoformat(),
                                "raw_data": {"scraped_via": "browser"}
                            }
                            all_leads.append(lead)
                            count += 1
                        except Exception as e:
                            logger.error(f"Error parsing post link: {e}")
                            
                except Exception as e:
                    logger.error(f"Error browsing hashtag {hashtag}: {e}")
                    
            browser.close()
            
        return all_leads

if __name__ == "__main__":
    # Test execution
    collector = FlowCollector()
    
    # Test Instagram (API)
    # print("Testing Instagram API Collector...")
    # results = collector.collect_instagram_leads(hashtags=["salonkosmetyczny"], max_posts=2)
    
    # Test Browser
    print("Testing Instagram Browser Collector...")
    results = collector.collect_instagram_browser(hashtags=["fryzjerkatowice"], max_posts=5)
    
    print(f"Found {len(results)} posts.")
    for res in results:
        print(f"- {res['url']}")
