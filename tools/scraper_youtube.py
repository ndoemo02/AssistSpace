import os
import datetime
import uuid
import json
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")

def get_channel_uploads_id(youtube, channel_id):
    """
    Retrieves the ID of the 'Uploads' playlist for a given channel.
    """
    try:
        request = youtube.channels().list(
            part="contentDetails",
            id=channel_id
        )
        response = request.execute()
        if "items" in response and len(response["items"]) > 0:
            return response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    except HttpError as e:
        print(f"Error fetching channel details for {channel_id}: {e}")
    return None

def resolve_channel_id(youtube, identifier):
    """
    Resolves a YouTube identifier (ID, Handle, or URL) to a Channel ID (UC...).
    """
    # 1. Already an ID? (Basic check: starts with UC and ~24 chars)
    if identifier.startswith("UC") and len(identifier) == 24:
        return identifier

    # 2. Extract Handle or ID from URL
    if "youtube.com" in identifier or "youtu.be" in identifier:
        if "/channel/" in identifier:
            return identifier.split("/channel/")[1].split("/")[0].split("?")[0]
        if "/@" in identifier:
            identifier = "@" + identifier.split("/@")[1].split("/")[0].split("?")[0]
    
    # 3. Resolve Handle via API
    if identifier.startswith("@"):
        try:
            print(f"Resolving handle {identifier}...")
            request = youtube.channels().list(
                part="id",
                forHandle=identifier
            )
            response = request.execute()
            if "items" in response and len(response["items"]) > 0:
                resolved_id = response["items"][0]["id"]
                print(f"Resolved {identifier} -> {resolved_id}")
                return resolved_id
            else:
                print(f"Handle {identifier} not found.")
                return None
        except HttpError as e:
            print(f"Error resolving handle {identifier}: {e}")
            return None

    # Fallback: Return as is (maybe it's a legacy username or user knows what they are doing)
    return identifier

def fetch_youtube_videos(channel_identifiers, max_results=5):
    """
    Fetches latest videos from a list of YouTube channel identifiers (IDs, handles, URLs).
    """
    if not API_KEY:
        print("Error: YOUTUBE_API_KEY not found in environment.")
        return []

    try:
        youtube = build("youtube", "v3", developerKey=API_KEY)
    except Exception as e:
        print(f"Error building YouTube service: {e}")
        return []

    news_items = []

    for identifier in channel_identifiers:
        print(f"Processing source: {identifier}")
        
        channel_id = resolve_channel_id(youtube, identifier)
        if not channel_id:
            print(f"Could not resolve Channel ID for: {identifier}")
            continue

        uploads_id = get_channel_uploads_id(youtube, channel_id)
        
        if not uploads_id:
            print(f"Could not find uploads for {channel_id}")
            continue

        try:
            request = youtube.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=uploads_id,
                maxResults=max_results
            )
            response = request.execute()

            for item in response.get("items", []):
                snippet = item["snippet"]
                video_id =  item["contentDetails"]["videoId"]
                
                news_item = {
                    "id": str(uuid.uuid4()),
                    "source_platform": "youtube",
                    "title": snippet["title"],
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "published_at": snippet["publishedAt"],
                    "thumbnail": snippet["thumbnails"]["high"]["url"] if "thumbnails" in snippet and "high" in snippet["thumbnails"] else None,
                    "summary_points": [],
                    "category": "Uncategorized",
                    "author_or_channel": snippet["channelTitle"],
                    "raw_content": snippet["description"] # Description is the best we get without captions
                }
                news_items.append(news_item)

        except HttpError as e:
            print(f"Error fetching uploads for {channel_id}: {e}")

    return news_items

if __name__ == "__main__":
    # Two Minute Papers: UCbfYPyITQ-7l4upoX8nvctg
    test_channels = ["UCbfYPyITQ-7l4upoX8nvctg"] 
    
    items = fetch_youtube_videos(test_channels, max_results=2)
    print(json.dumps(items, indent=2))
    print(f"Total items fetched: {len(items)}")
