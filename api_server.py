from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import subprocess
import threading
import sys
import os
import shutil
import tempfile
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


def run_agent_process(niche, location, sources):
    """Runs the main_agent.py in a separate process."""
    cmd = [sys.executable, "main_agent.py", "--mode", "flow-lead-gen", "--niche", niche]

    if location:
        cmd.extend(["--location", location])

    if sources:
        cmd.extend(["--sources"] + sources)

    print(f"Starting agent with command: {' '.join(cmd)}")

    try:
        # Run in a separate process to avoid blocking the server
        # We don't wait for it to finish here, as it can take minutes
        subprocess.Popen(cmd, cwd=os.getcwd())
    except Exception as e:
        print(f"Error starting agent: {e}")


def is_valid_youtube_url(url: str) -> bool:
    """Basic validation to allow only YouTube URLs."""
    try:
        parsed = urlparse(url.strip())
    except Exception:
        return False

    if parsed.scheme not in {"http", "https"}:
        return False

    host = (parsed.hostname or "").lower()
    allowed_hosts = {
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtu.be",
    }
    return host in allowed_hosts


@app.route('/api/run-flow', methods=['POST'])
def run_flow():
    data = request.json
    niche = data.get('niche')
    location = data.get('location')
    sources = data.get('sources', ['instagram'])  # Default to instagram

    if not niche:
        return jsonify({"error": "Niche is required"}), 400

    # Start the agent in a background thread/process
    thread = threading.Thread(target=run_agent_process, args=(niche, location, sources))
    thread.start()

    return jsonify({
        "status": "started",
        "message": f"FlowSearch started for niche: {niche}",
        "params": {
            "niche": niche,
            "location": location,
            "sources": sources
        }
    })


@app.route('/api/youtube-to-mp3', methods=['POST'])
def youtube_to_mp3():
    """
    Converts a YouTube URL to MP3 and returns the file.

    Request JSON:
    {
      "url": "https://www.youtube.com/watch?v=..."
    }
    """
    data = request.json or {}
    youtube_url = (data.get('url') or '').strip()

    if not youtube_url:
        return jsonify({"error": "Field 'url' is required"}), 400

    if not is_valid_youtube_url(youtube_url):
        return jsonify({"error": "Only YouTube URLs are allowed"}), 400

    if not shutil.which("yt-dlp"):
        return jsonify({
            "error": "yt-dlp is not installed on server. Install dependency and retry."
        }), 500

    if not shutil.which("ffmpeg"):
        return jsonify({
            "error": "ffmpeg is not installed on server. MP3 conversion requires ffmpeg."
        }), 500

    tmp_dir = tempfile.mkdtemp(prefix="ytmp3_")
    output_template = str(Path(tmp_dir) / "%(title).80s-%(id)s.%(ext)s")

    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "--no-playlist",
        "--output", output_template,
        youtube_url,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode != 0:
            return jsonify({
                "error": "Failed to convert YouTube video to MP3",
                "details": result.stderr.strip() or result.stdout.strip() or "Unknown error",
            }), 502

        mp3_files = sorted(Path(tmp_dir).glob("*.mp3"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not mp3_files:
            return jsonify({"error": "Conversion completed, but MP3 file was not found"}), 500

        mp3_path = mp3_files[0]

        @after_this_request
        def cleanup(response):
            try:
                shutil.rmtree(tmp_dir, ignore_errors=True)
            except Exception:
                pass
            return response

        return send_file(
            mp3_path,
            as_attachment=True,
            download_name=mp3_path.name,
            mimetype="audio/mpeg",
            max_age=0,
        )

    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return jsonify({"error": f"Unexpected server error: {e}"}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    port = 8000
    print(f"FlowAssist API running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port)
