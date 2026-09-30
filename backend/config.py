import os
import json

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
REPO_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))


class Config:
    """Central configuration for Fruit Quality Classification backend."""

    PROJECT_TITLE = "REEMA SAFRIN H – FRUIT QUALITY CLASSIFICATION"
    BASE_DIR = BASE_DIR
    REPO_ROOT = REPO_ROOT

    # Database configuration (SQLite)
    DATABASE_PATH = os.getenv(
        "DATABASE_PATH",
        os.path.join(BASE_DIR, "database", "fruit_quality.db")
    )

    # Class definitions
    DEFAULT_CLASS_NAMES = ["Fresh", "Rotten"]
    CLASS_NAMES_FILE = os.path.join(REPO_ROOT, "models", "class_names.json")

    @classmethod
    def get_class_names(cls):
        """
        Dynamically returns class names:
        Checks models/class_names.json first; falls back to DEFAULT_CLASS_NAMES.
        Supports binary (Fresh/Rotten) and multi-fruit (Apple_Fresh, Banana_Rotten, etc.).
        """
        if os.path.exists(cls.CLASS_NAMES_FILE):
            try:
                with open(cls.CLASS_NAMES_FILE, "r") as f:
                    data = json.load(f)
                    if isinstance(data, list) and len(data) > 0:
                        return data
                    elif isinstance(data, dict) and "classes" in data:
                        return data["classes"]
            except Exception as e:
                print(f"[config] Warning loading class_names.json: {e}")
        return cls.DEFAULT_CLASS_NAMES

    CLASS_NAMES = DEFAULT_CLASS_NAMES

    # Model paths
    MODEL_PATH = os.getenv(
        "MODEL_PATH",
        os.path.join(REPO_ROOT, "models", "fruit_quality_model.keras")
    )
    FALLBACK_MODEL_PATH = os.path.join(REPO_ROOT, "models", "best_model.keras")

    # Image upload configuration
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 5 * 1024 * 1024))  # 5 MB
    MAX_CONTENT_LENGTH = MAX_UPLOAD_SIZE
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    GENERATED_FOLDER = os.path.join(BASE_DIR, "generated")
