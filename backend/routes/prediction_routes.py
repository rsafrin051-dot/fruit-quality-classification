"""
Prediction API route for Fruit Quality Classification.
Handles image upload, format/size validation, model prediction,
Grad-CAM visualization, and database recording.
"""

import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image

from config import Config
from model.predictor import predict_image
from model.gradcam import generate_gradcam
from database.mongodb import db

prediction_bp = Blueprint('prediction_bp', __name__)


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


@prediction_bp.route('/api/predict', methods=['POST'])
def predict():
    # 1. Check file existence in request
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image file provided in request."}), 400

    file = request.files['image']
    if not file or file.filename.strip() == '':
        return jsonify({"success": False, "error": "No image selected. Please choose a fruit image."}), 400

    # 2. Validate file extension
    if not allowed_file(file.filename):
        allowed_list = ", ".join([f".{ext}" for ext in sorted(Config.ALLOWED_EXTENSIONS)])
        return jsonify({
            "success": False,
            "error": f"Invalid file type. Only image files ({allowed_list}) are supported."
        }), 400

    # 3. Read content and validate size (5 MB limit)
    try:
        file_bytes = file.read()
        file_size = len(file_bytes)
        if file_size > Config.MAX_UPLOAD_SIZE:
            return jsonify({
                "success": False,
                "error": f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed size of 5 MB."
            }), 400

        # Reset pointer for saving
        file.seek(0)
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to read uploaded file: {str(e)}"}), 400

    # 4. Generate safe unique filename
    raw_filename = secure_filename(file.filename) or "upload.jpg"
    unique_filename = f"{uuid.uuid4().hex}_{raw_filename}"
    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    try:
        file.save(filepath)
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to save uploaded image: {str(e)}"}), 500

    # 5. Verify image integrity with PIL
    try:
        with Image.open(filepath) as img:
            img.verify()
    except Exception:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"success": False, "error": "Corrupted or invalid image file. Please upload a clear photo."}), 400

    # 6. Execute model prediction
    try:
        result = predict_image(filepath, Config.MODEL_PATH)
    except FileNotFoundError as fnf_err:
        return jsonify({
            "success": False,
            "error": f"Trained model not found. Please train or initialize the model first. ({str(fnf_err)})"
        }), 503
    except Exception as pred_err:
        return jsonify({
            "success": False,
            "error": f"Prediction failed during model inference: {str(pred_err)}"
        }), 500

    # 7. Generate Grad-CAM heatmap
    gradcam_filename = None
    try:
        class_names = Config.get_class_names()
        predicted_idx = class_names.index(result["prediction"]) if result["prediction"] in class_names else 0
        gradcam_filename = generate_gradcam(filepath, Config.MODEL_PATH, predicted_idx)
    except Exception as g_err:
        print(f"[predict] Grad-CAM generation note: {g_err}")

    gradcam_url = f"/api/generated/{gradcam_filename}" if gradcam_filename else None
    image_url = f"/api/uploads/{unique_filename}"

    # 8. Store in SQLite Database
    record_id = None
    try:
        record = {
            "image_filename": unique_filename,
            "fruit_name": result["fruit_name"],
            "category": result["prediction"],
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "confidence_level": result["confidence_level"],
            "top_predictions": result["top_predictions"],
            "model_name": result["model_name"],
            "processing_time": result["processing_time"],
            "gradcam_path": gradcam_filename
        }
        record_id = db.insert_prediction(record)
    except Exception as db_err:
        print(f"[predict] Database insertion note: {db_err}")

    # 9. Format response
    response_payload = {
        "success": True,
        "id": record_id,
        "prediction": result["prediction"],
        "category": result["prediction"],
        "confidence": result["confidence"],
        "fruit_name": result["fruit_name"],
        "confidence_level": result["confidence_level"],
        "top_predictions": result["top_predictions"],
        "all_predictions": result["all_predictions"],
        "quality_info": result["quality_info"],
        "processing_time": result["processing_time"],
        "model_name": result["model_name"],
        "image_url": image_url,
        "gradcam_url": gradcam_url
    }

    return jsonify(response_payload), 200
