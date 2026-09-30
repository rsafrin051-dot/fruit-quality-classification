"""
Flask application server for REEMA SAFRIN H – FRUIT QUALITY CLASSIFICATION.
Handles image serving, API routing, database initialization, and model caching.
"""

import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from model.predictor import get_model, load_active_model

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")


def _resolve_model_path_from_repo():
    repo_root = Config.REPO_ROOT
    candidates = []
    env_path = os.getenv("MODEL_PATH")
    if env_path:
        candidates.append(os.path.abspath(os.path.expanduser(env_path)))
        if not os.path.isabs(env_path):
            candidates.append(os.path.abspath(os.path.join(repo_root, env_path)))
    candidates.extend([
        os.path.abspath(os.path.join(repo_root, "models", "fruit_quality_model.keras")),
        os.path.abspath(os.path.join(repo_root, "models", "best_model.keras")),
        os.path.abspath(os.path.join(repo_root, "models", "best_model.h5")),
    ])
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    return candidates[0] if candidates else os.path.abspath(os.path.join(repo_root, "models", "fruit_quality_model.keras"))


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load configuration
    app.config.from_object(Config)

    # Ensure upload and generated directories exist
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.GENERATED_FOLDER, exist_ok=True)

    @app.route('/api/generated/<path:filename>')
    def serve_generated(filename):
        return send_from_directory(Config.GENERATED_FOLDER, filename)

    @app.route('/api/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # Register blueprints
    from routes.prediction_routes import prediction_bp
    from routes.history_routes import history_bp
    from routes.dashboard_routes import dashboard_bp
    from routes.health_routes import health_bp
    from routes.model_routes import model_bp

    app.register_blueprint(prediction_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(model_bp)

    resolved_model_path = _resolve_model_path_from_repo()
    Config.MODEL_PATH = resolved_model_path
    print(f"[startup] Project: {Config.PROJECT_TITLE}")
    print(f"[startup] Resolved MODEL_PATH: {resolved_model_path}")
    print(f"[startup] Model file exists: {os.path.exists(resolved_model_path)}")
    print(f"[startup] Supported Classes: {Config.get_class_names()}")

    try:
        import tensorflow as tf
        import keras
        print(f"[startup] TensorFlow version: {tf.__version__}")
        print(f"[startup] Keras version: {keras.__version__}")
    except Exception as exc:
        print(f"[startup] TensorFlow/Keras version check: {exc}")

    try:
        if os.path.exists(resolved_model_path):
            load_active_model(resolved_model_path)
            print(f"[startup] Fruit Quality model loaded successfully: {get_model() is not None}")
        else:
            print(f"[startup] WARNING: Model not found at {resolved_model_path}.")
    except Exception as exc:
        print(f"[startup] ERROR loading model: {type(exc).__name__}: {exc}", file=sys.stderr)

    return app


# Module-level app instance
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    print(f"[startup] Starting Fruit Quality Classification backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
