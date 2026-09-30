"""
Fruit Quality Prediction Engine.
Loads and caches the trained MobileNetV2 transfer learning model once,
preprocesses input images with aspect-ratio preserving padding,
and produces accurate class predictions and confidence scores.
"""

import os
import time
import numpy as np
from PIL import Image, ImageOps, ImageEnhance

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
import tensorflow as tf

from config import Config
from utils.recommendations import get_fruit_quality_info

# Global Model Cache
_model = None
_model_path = None
_model_mtime = None


def _resolve_model_path(model_path=None):
    """Resolves model path to absolute path with fallback checks."""
    candidates = []
    if model_path:
        candidates.append(os.path.abspath(os.path.expanduser(str(model_path))))
    candidates.extend([
        os.path.abspath(Config.MODEL_PATH),
        os.path.abspath(Config.FALLBACK_MODEL_PATH),
        os.path.abspath(os.path.join(Config.REPO_ROOT, "models", "fruit_quality_model.keras")),
        os.path.abspath(os.path.join(Config.REPO_ROOT, "models", "best_model.keras")),
        os.path.abspath(os.path.join(Config.REPO_ROOT, "models", "best_model.h5")),
    ])
    for cand in candidates:
        if os.path.exists(cand):
            return cand
    return candidates[0] if candidates else os.path.abspath(Config.MODEL_PATH)


def load_active_model(model_path=None):
    """
    Loads and caches the active model instance.
    Does NOT reload the model if already in memory and file has not changed.
    """
    global _model, _model_path, _model_mtime
    resolved = _resolve_model_path(model_path)
    current_mtime = os.path.getmtime(resolved) if os.path.exists(resolved) else 0

    if _model is None or _model_path != resolved or _model_mtime != current_mtime:
        if not os.path.exists(resolved):
            raise FileNotFoundError(f"Model file not found at: {resolved}")
        print(f"[model] Loading Fruit Quality model from {resolved}...")
        _model = tf.keras.models.load_model(resolved, compile=False)
        _model_path = resolved
        _model_mtime = current_mtime
        print("[model] Fruit Quality model loaded and cached successfully.")

    return _model


def get_model():
    """Return currently cached model instance."""
    return _model


def _pil_to_mobilenet_array(pil_img: Image.Image) -> np.ndarray:
    """Converts a PIL image to a normalized [-1, 1] float32 numpy batch."""
    arr = np.array(pil_img, dtype=np.float32)
    # MobileNetV2 normalization: (x / 127.5) - 1.0 -> [-1, 1]
    arr = (arr / 127.5) - 1.0
    return np.expand_dims(arr, axis=0)


def preprocess_image(img_path: str):
    """
    Preprocesses uploaded fruit image:
    1. Loads in RGB mode.
    2. Preserves aspect ratio using square padding.
    3. Resizes to (224, 224) with Lanczos filtering.
    4. Generates array variants for Test-Time Augmentation (TTA).
    """
    with Image.open(img_path) as img:
        img = img.convert("RGB")
        w, h = img.size
        if w != h:
            max_dim = max(w, h)
            padded = Image.new("RGB", (max_dim, max_dim), (255, 255, 255))
            padded.paste(img, ((max_dim - w) // 2, (max_dim - h) // 2))
            img = padded

        img_resized = img.resize((224, 224), Image.Resampling.LANCZOS)

        augmented = []
        # Standard input
        augmented.append(_pil_to_mobilenet_array(img_resized))
        # Horizontal flip
        augmented.append(_pil_to_mobilenet_array(ImageOps.mirror(img_resized)))
        # Slight brightness adjustment
        bright = ImageEnhance.Brightness(img_resized).enhance(1.05)
        augmented.append(_pil_to_mobilenet_array(bright))

        return augmented


def determine_confidence_level(confidence: float) -> str:
    """Maps confidence percentage to qualitative level."""
    if confidence >= 75.0:
        return "High"
    elif confidence >= 50.0:
        return "Moderate"
    else:
        return "Low"


def extract_fruit_name(filename: str, category: str) -> str:
    """
    Derives likely fruit name from category or filename (e.g. 'Apple_Fresh' -> 'Apple',
    'fresh_apple.jpg' -> 'Apple').
    """
    clean_cat = category.lower().replace("-", "_").replace(" ", "_")
    for fruit in ["apple", "banana", "orange", "mango", "strawberry", "tomato", "grape"]:
        if fruit in clean_cat or fruit in filename.lower():
            return fruit.capitalize()
    return "Fruit"


def predict_image(img_path: str, model_path: str = None) -> dict:
    """
    Executes fruit quality prediction on an image.
    Returns structured prediction, confidence, quality details, and timing.
    """
    model = load_active_model(model_path)
    class_names = Config.get_class_names()

    # Preprocess with test-time augmentation
    augmented_arrays = preprocess_image(img_path)

    start_time = time.time()
    all_preds = []
    for arr in augmented_arrays:
        preds = model.predict(arr, verbose=0)[0]
        all_preds.append(preds)

    avg_predictions = np.mean(all_preds, axis=0)
    processing_time = time.time() - start_time

    # Rank classes
    num_classes = min(len(class_names), len(avg_predictions))
    top_indices = np.argsort(avg_predictions[:num_classes])[::-1]

    top_predictions = []
    for idx in top_indices:
        top_predictions.append({
            "category": class_names[idx],
            "confidence": float(round(float(avg_predictions[idx]) * 100, 2))
        })

    top_category = top_predictions[0]["category"]
    top_confidence = top_predictions[0]["confidence"]
    fruit_name = extract_fruit_name(os.path.basename(img_path), top_category)

    # Recommendations and food safety advice
    quality_info = get_fruit_quality_info(top_category)

    result = {
        "prediction": top_category,
        "category": top_category,
        "confidence": top_confidence,
        "fruit_name": fruit_name,
        "confidence_level": determine_confidence_level(top_confidence),
        "top_predictions": top_predictions,
        "all_predictions": top_predictions,
        "quality_info": quality_info,
        "processing_time": round(processing_time, 3),
        "model_name": os.path.basename(_model_path or Config.MODEL_PATH)
    }

    return result
