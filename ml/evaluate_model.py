"""
Model evaluation script for Fruit Quality Classification.
Loads a trained Keras model, generates predictions on a test/validation dataset,
and outputs classification metrics and confusion matrix.
"""

import os
import sys
import json
import argparse

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, CURRENT_DIR)

from preprocessing import IMG_SIZE, create_data_generators


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate Fruit Quality Model")
    parser.add_argument("--model", type=str, default="models/fruit_quality_model.keras", help="Path to trained model")
    parser.add_argument("--classes", type=str, default="models/class_names.json", help="Path to class names JSON")
    parser.add_argument("--dataset", type=str, default="dataset", help="Path to dataset directory")
    return parser.parse_args()


def evaluate():
    args = parse_args()
    model_path = os.path.abspath(args.model)
    classes_path = os.path.abspath(args.classes)
    dataset_path = os.path.abspath(args.dataset)

    if not os.path.exists(model_path):
        print(f"[ERROR] Model file not found at: {model_path}")
        sys.exit(1)

    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset directory not found at: {dataset_path}")
        sys.exit(1)

    import numpy as np
    import tensorflow as tf
    import sklearn.metrics as metrics

    print(f"[INFO] Loading model from: {model_path}")
    model = tf.keras.models.load_model(model_path, compile=False)

    class_names = []
    if os.path.exists(classes_path):
        with open(classes_path, "r") as f:
            class_names = json.load(f)

    _, val_gen, detected_classes, _ = create_data_generators(dataset_path, img_size=IMG_SIZE, batch_size=32)
    eval_classes = class_names if class_names else detected_classes

    val_gen.reset()
    y_pred_probs = model.predict(val_gen, verbose=1)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = val_gen.classes

    acc = metrics.accuracy_score(y_true, y_pred)
    f1 = metrics.f1_score(y_true, y_pred, average="weighted", zero_division=0)

    print("\n" + "=" * 50)
    print("        EVALUATION RESULTS")
    print("=" * 50)
    print(f"Accuracy: {acc * 100:.2f}%")
    print(f"F1-Score: {f1 * 100:.2f}%")
    print("\nClassification Report:\n")
    print(metrics.classification_report(y_true, y_pred, target_names=eval_classes, zero_division=0))


if __name__ == "__main__":
    evaluate()
