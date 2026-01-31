import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY")
    exit(1)

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL to create the table
start_sql = """
create table if not exists sources (
    id uuid default gen_random_uuid() primary key,
    platform text not null,
    identifier text not null,
    name text,
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
"""

rls_sql = """
alter table sources enable row level security;
"""

policy_read = """
create policy "Allow public read access" on sources for select using (true);
"""

policy_insert = """
create policy "Allow public insert access" on sources for insert with check (true);
"""

policy_delete = """
create policy "Allow public delete access" on sources for delete using (true);
"""

# Supabase-py doesn't expose a direct 'query' method for DDL easily unless via RPC or specific admin endpoints usually.
# However, if the KEY is a Service Role Key, we might have more access, but standard client uses PostgREST.
# PostgREST DOES NOT support DDL (CREATE TABLE).
# We usually need to run migrations or use the dashboard.

# BUT, sometimes there is a 'execute_sql' RPC function if pre-installed.
# Let's try to see if we can just PRINT the instructions for the user if we can't run it.
# Actually, the user has a "Service Key" in .env? 
# "sb_secret_..." looks like it *might* be a service key or just a weirdly named anon key.
# If it's anon, we can't do DDL.

# Wait, the user said "nie umiem potwierdzic dostepu" (I can't confirm access). 
# This implies they are seeing a prompt.
# I should generate a migration file if they are using local supabase, but they are using cloud.

print("To fix the 'sources' table issue, please run this SQL in your Supabase Dashboard SQL Editor:")
print("-" * 20)
print(start_sql)
print(rls_sql)
print(policy_read)
print(policy_insert)
print(policy_delete)
print("-" * 20)
