import requests
from datetime import datetime
import uuid
import json

def fetch_github_trending(repositories=None, language="python"):
    """
    Fetches trending repositories or specific repositories from GitHub.
    Since we don't have a token, we use public search or specific repo APIs.
    """
    news_items = []
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    # If no specific repos, fetch trending/recent AI projects
    if not repositories:
        # Search for repositories with 'ai' in name/desc, sorted by stars
        url = f"https://api.github.com/search/repositories?q=ai+language:{language}&sort=stars&order=desc"
        try:
            print("Fetching trending AI repositories from GitHub...")
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for repo in data.get("items", [])[:10]:
                    item = {
                        "id": str(uuid.uuid4()),
                        "source_platform": "github",
                        "title": repo["full_name"],
                        "url": repo["html_url"],
                        "published_at": repo["pushed_at"],
                        "thumbnail": repo["owner"]["avatar_url"],
                        "summary_points": [],
                        "category": "tools",
                        "author_or_channel": repo["owner"]["login"],
                        "raw_content": repo["description"] or "No description available"
                    }
                    news_items.append(item)
            else:
                print(f"GitHub API Error: {response.status_code}")
        except Exception as e:
            print(f"Error fetching GitHub trends: {e}")
    else:
        # Fetch specific repositories
        for repo_name in repositories:
            url = f"https://api.github.com/repos/{repo_name}"
            try:
                print(f"Fetching GitHub repo: {repo_name}")
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    repo = response.json()
                    item = {
                        "id": str(uuid.uuid4()),
                        "source_platform": "github",
                        "title": repo["full_name"],
                        "url": repo["html_url"],
                        "published_at": repo["pushed_at"],
                        "thumbnail": repo["owner"]["avatar_url"],
                        "summary_points": [],
                        "category": "tools",
                        "author_or_channel": repo["owner"]["login"],
                        "raw_content": repo["description"] or "No description available"
                    }
                    news_items.append(item)
            except Exception as e:
                print(f"Error fetching {repo_name}: {e}")
                
    return news_items

if __name__ == "__main__":
    # Test
    items = fetch_github_trending()
    print(json.dumps(items[:2], indent=2))
    print(f"Total GitHub items: {len(items)}")
