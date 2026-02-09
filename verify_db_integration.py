from tools.db_client import save_leads, get_supabase_client
from datetime import datetime

client = get_supabase_client()
if not client:
    print("Error: Could not meaningful client")
    exit(1)

test_lead = {
    "company_name": "Test Salon Warsaw",
    "owner_username": "test_salon_waw",
    "url": "https://instagram.com/test_salon_waw",
    "score_val": 85,
    "automation_readiness": "hot", 
    "website_url": None,
    "pain_signals": ["Price inquiry", "Booking issue"],
    "pain_score": 8,
    "automation_gap_score": 9,
    "platform": "instagram"
}

print("Saving test lead...")
res = save_leads([test_lead])
print(f"Save Result: {res}")

print("Verifying in DB...")
data = client.table("leads").select("*").eq("company_name", "Test Salon Warsaw").execute()
if data.data:
    print("SUCCESS: Found lead in DB!")
    print(data.data[0])
else:
    print("FAILURE: Lead not found in DB.")
