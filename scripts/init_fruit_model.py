"""
Model initialization script for Fruit Quality Classification.
Builds and initializes the MobileNetV2 transfer learning model for Fruit Quality,
and saves the compiled model to models/fruit_quality_model.keras.
"""

import os
import sys
import json
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
MODEL_OUTPUT_PATH = os.path.join(MODELS_DIR, "fruit_quality_model.keras")
CLASSES_OUTPUT_PATH = os.path.join(MODELS_DIR, "class_names.json")

os.makedirs(MODELS_DIR, exist_ok=True)

CLASS_NAMES = ["Fresh", "Rotten"]

def init_model():
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization, Input
    from tensorflow.keras.optimizers import Adam

    print("=" * 60)
    print("  INITIALIZING FRUIT QUALITY MOBILENET-V2 MODEL")
    print("=" * 60)
    print(f"TensorFlow Version: {tf.__version__}")
    print(f"Target Output:      {MODEL_OUTPUT_PATH}")
    print(f"Classes:            {CLASS_NAMES}")

    # Build backbone
    print("\n[1/3] Downloading & configuring MobileNetV2 backbone (ImageNet)...")
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False

    # Build classification head
    print("[2/3] Adding custom Fruit Quality classification head...")
    model = Sequential([
        Input(shape=(224, 224, 3), name="input_image"),
        base_model,
        GlobalAveragePooling2D(name="global_avg_pool"),
        BatchNormalization(name="bn_1"),
        Dense(256, activation="relu", name="dense_features"),
        Dropout(0.4, name="dropout_1"),
        Dense(len(CLASS_NAMES), activation="softmax", name="quality_output")
    ], name="FruitQualityMobileNetV2")

    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    model.summary()

    # Save model and class names
    print(f"\n[3/3] Saving model to {MODEL_OUTPUT_PATH}...")
    model.save(MODEL_OUTPUT_PATH)

    with open(CLASSES_OUTPUT_PATH, "w") as f:
        json.dump(CLASS_NAMES, f, indent=2)

    print(f"\n[SUCCESS] Model saved to: {MODEL_OUTPUT_PATH}")
    print(f"[SUCCESS] Class names saved to: {CLASSES_OUTPUT_PATH}")
    print(f"File size: {os.path.getsize(MODEL_OUTPUT_PATH) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    init_model()
