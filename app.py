"""
Flask API Backend for Temporal Style Evolution Tracker
Provides REST API endpoints for the frontend
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
from typing import Dict, List, Optional
import os

from temporal_tracker import TemporalTracker

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)  # Enable CORS for React frontend

# Initialize tracker
tracker = TemporalTracker()


@app.route('/')
def serve():
    """Serve React frontend"""
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except Exception:
        # If frontend build doesn't exist, return helpful message
        return jsonify({
            "message": "Backend API is running",
            "status": "Frontend not built yet",
            "api_url": "/api",
            "health": "/api/health",
            "instructions": "Run 'cd frontend && npm start' to start React dev server on port 3000"
        }), 200


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Temporal Style Tracker API"})


@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """Analyze a single text for authenticity"""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Analyze text
        authenticity_score = tracker._analyze_authenticity(text)
        style_features = tracker._extract_style_features(text)
        
        return jsonify({
            "authenticity_score": authenticity_score,
            "style_features": style_features,
            "prediction": "human" if authenticity_score > 0.5 else "ai",
            "confidence": abs(authenticity_score - 0.5) * 2  # Normalize to 0-1
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/documents', methods=['GET'])
def list_documents():
    """Get list of all tracked documents"""
    documents = {
        doc_id: {
            "document_id": doc_id,
            "version_count": len(versions),
            "latest_version": versions[-1].version_id if versions else None,
            "created_at": versions[0].timestamp.isoformat() if versions else None,
            "updated_at": versions[-1].timestamp.isoformat() if versions else None
        }
        for doc_id, versions in tracker.documents.items()
    }
    return jsonify({"documents": list(documents.values())})


@app.route('/api/documents/<document_id>/versions', methods=['POST'])
def add_version(document_id: str):
    """Add a new version to a document"""
    data = request.json
    text = data.get('text', '')
    metadata = data.get('metadata', {})
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        snapshot = tracker.add_version(document_id, text, metadata=metadata)
        
        return jsonify({
            "version_id": snapshot.version_id,
            "timestamp": snapshot.timestamp.isoformat(),
            "authenticity_score": snapshot.authenticity_score,
            "style_features": snapshot.style_features,
            "metadata": snapshot.metadata
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/documents/<document_id>/versions', methods=['GET'])
def get_versions(document_id: str):
    """Get all versions of a document"""
    versions = tracker.documents.get(document_id, [])
    
    return jsonify({
        "document_id": document_id,
        "versions": [
            {
                "version_id": v.version_id,
                "timestamp": v.timestamp.isoformat(),
                "text": v.text,
                "authenticity_score": v.authenticity_score,
                "style_features": v.style_features,
                "metadata": v.metadata
            }
            for v in versions
        ]
    })


@app.route('/api/documents/<document_id>/analysis', methods=['GET'])
def get_analysis(document_id: str):
    """Get analysis of document version history"""
    try:
        analysis = tracker.analyze_version_history(document_id)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/documents/<document_id>/drift', methods=['GET'])
def get_drift(document_id: str):
    """Get style drift detection for a document"""
    try:
        drift = tracker.detect_style_drift(document_id)
        return jsonify(drift)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/documents/<document_id>', methods=['DELETE'])
def delete_document(document_id: str):
    """Delete a document and all its versions"""
    if document_id in tracker.documents:
        del tracker.documents[document_id]
        tracker._save_history()
        return jsonify({"message": f"Document {document_id} deleted"}), 200
    return jsonify({"error": "Document not found"}), 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))  # Changed default to 8000
    print(f"\n🚀 Flask server starting on http://localhost:{port}")
    print(f"📊 API available at http://localhost:{port}/api\n")
    app.run(host='0.0.0.0', port=port, debug=True)
