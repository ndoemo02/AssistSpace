import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client():
    """Returns a Supabase client instance if credentials exist, else None."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return None

def save_news_items(items):
    """
    Upserts a list of news items into the 'news_items' table.
    Filters out items that already exist in the DB based on URL.
    """
    client = get_supabase_client()
    if not client:
        return {"success": False, "error": "Supabase credentials missing or invalid"}

    if not items:
        return {"success": True, "count": 0}

    try:
        # 1. Fetch existing URLs to avoid duplicates
        # We fetch all URLs from the last X days or just all if list is small. 
        # For simplicity, if we have many, we might want to check the specific URLs in the batch.
        urls_to_check = [item['url'] for item in items]
        
        # Split into chunks if there are too many URLs for the 'in' filter
        existing_urls = []
        for i in range(0, len(urls_to_check), 100):
            chunk = urls_to_check[i:i + 100]
            response = client.table("news_items").select("url").in_("url", chunk).execute()
            if response.data:
                existing_urls.extend([r['url'] for r in response.data])

        # 2. Filter out duplicates
        new_items = [item for item in items if item['url'] not in existing_urls]
        
        if not new_items:
            print("No new items to save. All items already exist.")
            return {"success": True, "count": 0}

        print(f"Saving {len(new_items)} new items (filtered out {len(items) - len(new_items)} duplicates).")
        
        # 3. Perform the save (using insert since we've filtered dupes)
        # Using upsert on ID just in case, or simple insert.
        response = client.table("news_items").insert(new_items).execute()
        
        return {"success": True, "count": len(response.data) if response.data else 0}
        
    except Exception as e:
        print(f"Supabase Ops Error: {e}")
        return {"success": False, "error": str(e)}

def save_leads(leads):
    """
    Upserts a list of leads into the 'leads' table.
    """
    client = get_supabase_client()
    if not client:
        return {"success": False, "error": "Supabase credentials missing"}

    if not leads:
        return {"success": True, "count": 0}

    try:
        # Prepare data for insertion
        # Map FlowAssist lead structure to DB schema
        db_records = []
        for lead in leads:
            record = {
                "company_name": lead.get("company_name") or lead.get("owner_username", "Unknown"),
                "status": "detected",
                "automation_readiness": "not_ready", # Default, updated by scorer
                "score": int(lead.get("score_val", 0)),
                "industry": "Beauty", # Default/Placeholder, should come from enricher
                "website": lead.get("website_url"),
                "detected_at": "now()",
                "last_updated": "now()",
                # Store complex objects as JSON
                "signals": lead.get("signals", []), 
                "contact_info": {
                    "username": lead.get("owner_username"),
                    "url": lead.get("url"),
                    "phone": lead.get("public_phone_country_code") # if available
                },
                "notes": f"Pain Score: {lead.get('pain_score', 0)}, Gap Score: {lead.get('automation_gap_score', 0)}",
                "tags": [lead.get("platform", "instagram")]
            }
            
            # Refine Readiness based on Score
            score = record["score"]
            if score >= 80: record["automation_readiness"] = "hot"
            elif score >= 50: record["automation_readiness"] = "warm"
            elif score >= 30: record["automation_readiness"] = "cold"
            
            db_records.append(record)

        # 1. Upsert (to avoid duplicates based on company_name and platform tags)
        print(f"Upserting {len(db_records)} leads to Supabase...")
        response = client.table("leads").upsert(
            db_records, 
            on_conflict="company_name,tags"
        ).execute()
        
        return {"success": True, "count": len(response.data) if response.data else 0}

    except Exception as e:
        print(f"Supabase Ops Error (Leads): {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test connection
    client = get_supabase_client()
    if client:
        print("Supabase client initialized successfully.")
    else:
        print("Supabase client failed to initialize.")
