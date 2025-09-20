# API Bridge Server to connect Streamlit data with React Frontend
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import json
import os
from datetime import datetime
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Shared data store (in production, use Redis or database)
shared_data = {
    "latest_analysis": None,
    "analysis_history": [],
    "last_updated": None
}

# File-based data sharing (alternative to in-memory)
DATA_FILE = os.path.join(os.path.dirname(__file__), 'shared_analysis_data.json')

def save_data_to_file():
    """Save shared data to file for persistence"""
    try:
        with open(DATA_FILE, 'w') as f:
            # Convert datetime objects to strings for JSON serialization
            data_copy = shared_data.copy()
            if data_copy["last_updated"]:
                data_copy["last_updated"] = data_copy["last_updated"].isoformat()
            json.dump(data_copy, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")

def load_data_from_file():
    """Load shared data from file"""
    global shared_data
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                if data.get("last_updated"):
                    data["last_updated"] = datetime.fromisoformat(data["last_updated"])
                shared_data.update(data)
    except Exception as e:
        print(f"Error loading data: {e}")

# Load existing data on startup
load_data_from_file()

@app.route('/api/threat-analysis', methods=['POST'])
def receive_analysis():
    """Receive analysis data from Streamlit app"""
    try:
        data = request.json
        
        # Structure the analysis data
        analysis = {
            "id": str(int(time.time() * 1000)),  # Unique ID
            "timestamp": datetime.now(),
            "threat_class": data.get("threat_class"),
            "confidence": data.get("confidence"),
            "probabilities": data.get("probabilities", {}),
            "features": data.get("features", {}),
            "recommendations": data.get("recommendations", []),
            "risk_level": data.get("risk_level", "Unknown")
        }
        
        # Update shared data
        shared_data["latest_analysis"] = analysis
        shared_data["last_updated"] = datetime.now()
        
        # Add to history (keep last 50 analyses)
        shared_data["analysis_history"].append(analysis)
        if len(shared_data["analysis_history"]) > 50:
            shared_data["analysis_history"] = shared_data["analysis_history"][-50:]
        
        # Save to file
        save_data_to_file()
        
        return jsonify({"status": "success", "message": "Analysis data received"})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/threat-analysis', methods=['GET'])
def get_latest_analysis():
    """Get latest analysis for React frontend"""
    try:
        if shared_data["latest_analysis"]:
            # Convert datetime to ISO string for JSON response
            analysis = shared_data["latest_analysis"].copy()
            if isinstance(analysis["timestamp"], datetime):
                analysis["timestamp"] = analysis["timestamp"].isoformat()
            
            return jsonify({
                "status": "success",
                "data": analysis,
                "last_updated": shared_data["last_updated"].isoformat() if shared_data["last_updated"] else None
            })
        else:
            return jsonify({
                "status": "success",
                "data": None,
                "message": "No analysis data available"
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/threat-analysis/history', methods=['GET'])
def get_analysis_history():
    """Get analysis history for React frontend"""
    try:
        # Convert datetime objects to ISO strings
        history = []
        for analysis in shared_data["analysis_history"]:
            analysis_copy = analysis.copy()
            if isinstance(analysis_copy["timestamp"], datetime):
                analysis_copy["timestamp"] = analysis_copy["timestamp"].isoformat()
            history.append(analysis_copy)
        
        return jsonify({
            "status": "success",
            "data": history,
            "count": len(history)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "last_analysis": shared_data["last_updated"].isoformat() if shared_data["last_updated"] else None
    })

if __name__ == '__main__':
    print("🌉 API Bridge Server Starting...")
    print("📡 Bridging Streamlit ↔ React Frontend")
    print("🚀 Server running on http://localhost:5000")
    
    # Get port from environment variable (for deployment) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)