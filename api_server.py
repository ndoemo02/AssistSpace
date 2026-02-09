from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import threading
import sys
import os
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

@app.route('/api/run-flow', methods=['POST'])
def run_flow():
    data = request.json
    niche = data.get('niche')
    location = data.get('location')
    sources = data.get('sources', ['instagram']) # Default to instagram
    
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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    port = 8000
    print(f"FlowAssist API running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port)
