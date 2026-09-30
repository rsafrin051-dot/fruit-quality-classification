"""
Dashboard API routes for Fruit Quality Classification.
Provides aggregated metrics, quality distribution, and recent prediction records.
"""

from flask import Blueprint, jsonify
from database.db import db

dashboard_bp = Blueprint('dashboard_bp', __name__)


@dashboard_bp.route('/api/dashboard/stats', methods=['GET'])
@dashboard_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    try:
        stats = db.get_dashboard_stats()
        return jsonify({
            "success": True,
            **stats
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve dashboard statistics: {str(e)}"
        }), 500
