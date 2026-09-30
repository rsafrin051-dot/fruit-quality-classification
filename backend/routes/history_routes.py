"""
History API routes for Fruit Quality Classification.
Provides paginated query access and deletion for past prediction records.
"""

from flask import Blueprint, jsonify, request
from database.db import db

history_bp = Blueprint('history_bp', __name__)


@history_bp.route('/api/predictions', methods=['GET'])
def get_history():
    try:
        page = max(1, int(request.args.get('page', 1)))
        limit = max(1, min(100, int(request.args.get('limit', 10))))
        skip = (page - 1) * limit

        predictions = db.get_predictions(skip=skip, limit=limit)
        total = db.get_total_count()

        return jsonify({
            "success": True,
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": (skip + len(predictions)) < total,
            "data": predictions
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to retrieve history: {str(e)}"}), 500


@history_bp.route('/api/predictions/<int:prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    try:
        success = db.delete_prediction(prediction_id)
        if success:
            return jsonify({
                "success": True,
                "message": f"Prediction record #{prediction_id} deleted successfully."
            }), 200
        return jsonify({"success": False, "error": f"Record #{prediction_id} not found."}), 404
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to delete prediction: {str(e)}"}), 500
