"""
Health check route for Fruit Quality Classification.
Verifies server health, SQLite database connectivity, and model loading status.
"""

from flask import Blueprint, jsonify
from database.db import db
from model.predictor import get_model
from config import Config

health_bp = Blueprint('health_bp', __name__)


@health_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "project": Config.PROJECT_TITLE,
        "model_loaded": get_model() is not None,
        "database_connected": db.connected,
        "classes": Config.get_class_names()
    }), 200
