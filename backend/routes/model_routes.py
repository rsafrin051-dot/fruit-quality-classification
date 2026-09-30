"""
Model performance routes for Fruit Quality Classification.
Provides information on the active MobileNetV2 architecture and available models.
"""

import os
from flask import Blueprint, jsonify
from database.db import db
from config import Config

model_bp = Blueprint('model_bp', __name__)

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))


@model_bp.route('/api/model-performance', methods=['GET'])
def get_model_performance():
    """Return live model info and classification stats from the database."""
    try:
        stats = db.get_dashboard_stats()

        models_info = []
        model_files = {
            'fruit_quality_model.keras': {
                'name': 'MobileNetV2 (Active)',
                'arch': 'MobileNetV2 Transfer Learning',
                'active': True
            },
            'best_model.keras': {
                'name': 'Base Model',
                'arch': 'MobileNet / CNN',
                'active': False
            },
        }

        for filename, info in model_files.items():
            path = os.path.join(MODELS_DIR, filename)
            if os.path.exists(path):
                size_mb = round(os.path.getsize(path) / (1024 * 1024), 2)
                models_info.append({
                    'filename': filename,
                    'name': info['name'],
                    'architecture': info['arch'],
                    'size_mb': size_mb,
                    'active': info['active'],
                    'status': 'Active' if info['active'] else 'Available'
                })

        return jsonify({
            'success': True,
            'models': models_info,
            'stats': stats,
            'active_model': os.path.basename(Config.MODEL_PATH)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
