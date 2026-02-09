
from tools.flow_collector import FlowCollector
import json
import os
from dotenv import load_dotenv

load_dotenv()

collector = FlowCollector()
print("Fetching 1 post to debug structure...")
try:
    results = collector.collect_instagram_leads(["salonkosmetyczny"], max_posts=1)
except Exception as e:
    print(f"Error: {e}")
    results = []

if results:
    print("Found results!")
    with open("apify_debug_dump.json", "w", encoding="utf-8") as f:
        json.dump(results[0], f, indent=2, default=str)
    print("Dumped first result to apify_debug_dump.json")
    
    # Also print keys to console
    print("Top level keys:", list(results[0].keys()))
    if "raw_data" in results[0]:
        print("Raw data keys:", list(results[0]["raw_data"].keys()))
else:
    print("No results found.")
