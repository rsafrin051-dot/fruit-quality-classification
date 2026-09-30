"""
Training script for Fruit Quality Classification using MobileNetV2 Transfer Learning.

Pipeline:
1. Load & validate dataset
2. Display class distribution
3. Apply preprocessing & data augmentation
4. Build MobileNetV2 transfer learning model (frozen base + custom classifier)
5. Train head classifier
6. Optionally fine-tune upper layers of MobileNetV2
7. Evaluate on validation data: Accuracy, Precision, Recall, F1-Score, Confusion Matrix
8. Save trained model to models/fruit_quality_model.keras
9. Save class names to models/class_names.json
10. Save training curves and confusion matrix to reports/

Run separately:
python ml/train_model.py --dataset dataset --epochs 10 --batch_size 32
"""

import os
import sys
import json
import time
import argparse

# Ensure backend and ml folders are in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, CURRENT_DIR)

from preprocessing import (
    IMG_SIZE,
    BATCH_SIZE,
    scan_dataset_structure,
    create_data_generators
)


def parse_arguments():
    parser = argparse.ArgumentParser(description="Fruit Quality Classification Model Trainer")
    parser.add_argument("--dataset", type=str, default="dataset", help="Path to fruit quality dataset directory")
    parser.add_argument("--epochs", type=int, default=10, help="Initial training epochs for classifier head")
    parser.add_argument("--fine_tune_epochs", type=int, default=5, help="Fine-tuning epochs (0 to disable)")
    parser.add_argument("--batch_size", type=int, default=32, help="Mini-batch size")
    parser.add_argument("--learning_rate", type=float, default=1e-3, help="Initial learning rate")
    parser.add_argument("--output_model", type=str, default="models/fruit_quality_model.keras", help="Path to save model")
    parser.add_argument("--output_classes", type=str, default="models/class_names.json", help="Path to save class mapping")
    return parser.parse_args()


def build_transfer_model(num_classes: int, learning_rate: float = 1e-3):
    """
    Builds a MobileNetV2 transfer learning architecture.
    Base model initialized with ImageNet weights, frozen initially.
    """
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization, Input
    from tensorflow.keras.optimizers import Adam

    print(f"\n[INFO] Initializing MobileNetV2 backbone (ImageNet weights, input shape {IMG_SIZE + (3,)})...")
    base_model = MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights="imagenet"
    )

    # Freeze base feature extractor
    base_model.trainable = False

    # Top classification head
    model = Sequential([
        Input(shape=IMG_SIZE + (3,), name="input_image"),
        base_model,
        GlobalAveragePooling2D(name="global_avg_pool"),
        BatchNormalization(name="bn_1"),
        Dense(256, activation="relu", name="dense_features"),
        Dropout(0.4, name="dropout_1"),
        Dense(num_classes, activation="softmax", name="quality_output")
    ], name="FruitQualityMobileNetV2")

    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model, base_model


def plot_and_save_metrics(history, history_fine, reports_dir: str):
    """Generates and saves accuracy/loss training curves."""
    try:
        import matplotlib.pyplot as plt

        acc = history.history.get("accuracy", [])
        val_acc = history.history.get("val_accuracy", [])
        loss = history.history.get("loss", [])
        val_loss = history.history.get("val_loss", [])

        if history_fine:
            acc += history_fine.history.get("accuracy", [])
            val_acc += history_fine.history.get("val_accuracy", [])
            loss += history_fine.history.get("loss", [])
            val_loss += history_fine.history.get("val_loss", [])

        epochs_range = range(1, len(acc) + 1)

        plt.figure(figsize=(12, 5))

        # Accuracy Curve
        plt.subplot(1, 2, 1)
        plt.plot(epochs_range, acc, label="Training Accuracy", marker="o", color="#10b981")
        plt.plot(epochs_range, val_acc, label="Validation Accuracy", marker="s", color="#3b82f6")
        plt.title("Model Accuracy per Epoch", fontsize=13)
        plt.xlabel("Epoch")
        plt.ylabel("Accuracy")
        plt.legend(loc="lower right")
        plt.grid(True, linestyle="--", alpha=0.5)

        # Loss Curve
        plt.subplot(1, 2, 2)
        plt.plot(epochs_range, loss, label="Training Loss", marker="o", color="#ef4444")
        plt.plot(epochs_range, val_loss, label="Validation Loss", marker="s", color="#f59e0b")
        plt.title("Model Loss per Epoch", fontsize=13)
        plt.xlabel("Epoch")
        plt.ylabel("Loss")
        plt.legend(loc="upper right")
        plt.grid(True, linestyle="--", alpha=0.5)

        plt.tight_layout()
        plot_path = os.path.join(reports_dir, "fruit_quality_training_curves.png")
        plt.savefig(plot_path, dpi=200)
        plt.close()
        print(f"[INFO] Training curves saved to: {plot_path}")
    except Exception as exc:
        print(f"[WARNING] Could not save training curves plot: {exc}")


def evaluate_and_save_confusion_matrix(model, val_gen, class_names: list, reports_dir: str):
    """
    Evaluates model on validation data, calculates precision, recall, f1, and
    saves confusion matrix plot.
    """
    import numpy as np
    import sklearn.metrics as metrics
    import matplotlib.pyplot as plt

    print("\n[INFO] Running evaluation on validation dataset...")
    val_gen.reset()
    y_pred_probs = model.predict(val_gen, verbose=1)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = val_gen.classes

    # Metrics
    acc = metrics.accuracy_score(y_true, y_pred)
    prec = metrics.precision_score(y_true, y_pred, average="weighted", zero_division=0)
    rec = metrics.recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1 = metrics.f1_score(y_true, y_pred, average="weighted", zero_division=0)
    cm = metrics.confusion_matrix(y_true, y_pred)

    print("\n" + "=" * 55)
    print("           MODEL EVALUATION SUMMARY")
    print("=" * 55)
    print(f"Overall Accuracy:  {acc * 100:.2f}%")
    print(f"Weighted Precision: {prec * 100:.2f}%")
    print(f"Weighted Recall:    {rec * 100:.2f}%")
    print(f"Weighted F1-Score:  {f1 * 100:.2f}%")
    print("=" * 55)
    print("\nClassification Report:\n")
    print(metrics.classification_report(y_true, y_pred, target_names=class_names, zero_division=0))

    # Save Confusion Matrix Plot
    try:
        fig, ax = plt.subplots(figsize=(7, 6))
        disp = metrics.ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
        disp.plot(cmap=plt.cm.Greens, ax=ax, colorbar=True)
        plt.title("Confusion Matrix - Fruit Quality Classification", fontsize=12)
        plt.tight_layout()
        cm_path = os.path.join(reports_dir, "fruit_quality_confusion_matrix.png")
        plt.savefig(cm_path, dpi=200)
        plt.close()
        print(f"[INFO] Confusion matrix plot saved to: {cm_path}")
    except Exception as exc:
        print(f"[WARNING] Could not plot confusion matrix: {exc}")

    # Save metrics JSON
    metrics_summary = {
        "accuracy": round(float(acc) * 100, 2),
        "precision": round(float(prec) * 100, 2),
        "recall": round(float(rec) * 100, 2),
        "f1_score": round(float(f1) * 100, 2),
        "classes": class_names,
        "confusion_matrix": cm.tolist()
    }
    with open(os.path.join(reports_dir, "evaluation_metrics.json"), "w") as f:
        json.dump(metrics_summary, f, indent=2)

    return metrics_summary


def main():
    args = parse_arguments()
    dataset_path = os.path.abspath(args.dataset)
    output_model_path = os.path.abspath(args.output_model)
    output_classes_path = os.path.abspath(args.output_classes)
    reports_dir = os.path.abspath(os.path.join(PROJECT_ROOT, "reports"))

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    os.makedirs(os.path.dirname(output_classes_path), exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    print("=" * 60)
    print("  REEMA SAFRIN H – FRUIT QUALITY CLASSIFICATION TRAINING")
    print("=" * 60)
    print(f"Dataset path:      {dataset_path}")
    print(f"Target model save: {output_model_path}")
    print(f"Target class save: {output_classes_path}")

    # 1. Dataset inspection and validation
    print("\n[STEP 1/5] Inspecting & Validating Dataset...")
    try:
        dataset_info = scan_dataset_structure(dataset_path)
    except Exception as e:
        print(f"[ERROR] Dataset validation failed: {e}")
        print("\nPlease ensure your dataset folder has class subdirectories (e.g. dataset/Fresh, dataset/Rotten).")
        sys.exit(1)

    print(f"[INFO] Dataset mode detected: {dataset_info['mode']}")
    print(f"[INFO] Classes detected: {dataset_info['classes']}")
    print(f"[INFO] Distribution: {json.dumps(dataset_info['distribution'], indent=2)}")

    if len(dataset_info["classes"]) < 2:
        print(f"[ERROR] At least 2 classes are required for classification. Found: {dataset_info['classes']}")
        sys.exit(1)

    # 2. Data generators
    print("\n[STEP 2/5] Creating Preprocessed & Augmented Data Generators...")
    train_gen, val_gen, ordered_classes, class_indices = create_data_generators(
        dataset_dir=dataset_path,
        img_size=IMG_SIZE,
        batch_size=args.batch_size
    )
    print(f"[INFO] Train samples: {train_gen.samples}, Validation samples: {val_gen.samples}")
    print(f"[INFO] Class index mapping: {class_indices}")

    # Save class names immediately so prediction API can access them
    with open(output_classes_path, "w") as f:
        json.dump(ordered_classes, f, indent=2)
    print(f"[INFO] Class names saved to {output_classes_path}")

    # 3. Model construction
    print("\n[STEP 3/5] Building MobileNetV2 Transfer Learning Architecture...")
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
    from tensorflow.keras.optimizers import Adam

    num_classes = len(ordered_classes)
    model, base_model = build_transfer_model(num_classes=num_classes, learning_rate=args.learning_rate)
    model.summary()

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True, verbose=1),
        ModelCheckpoint(output_model_path, monitor="val_accuracy", save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6, verbose=1)
    ]

    # 4. Phase 1 Training (Feature Extraction)
    print(f"\n[STEP 4/5] Training Classifier Head ({args.epochs} epochs)...")
    start_time = time.time()
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=args.epochs,
        callbacks=callbacks
    )
    phase1_time = time.time() - start_time
    print(f"[INFO] Phase 1 training finished in {phase1_time:.2f} seconds.")

    # Optional Phase 2 Training (Fine-Tuning)
    history_fine = None
    if args.fine_tune_epochs > 0:
        print(f"\n[STEP 4b/5] Fine-Tuning Top Layers of MobileNetV2 ({args.fine_tune_epochs} epochs)...")
        base_model.trainable = True
        # Freeze all layers except top 30 layers
        for layer in base_model.layers[:-30]:
            layer.trainable = False

        model.compile(
            optimizer=Adam(learning_rate=args.learning_rate / 10.0),
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )

        history_fine = model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=args.fine_tune_epochs,
            callbacks=callbacks
        )

    # 5. Final Evaluation & Reports
    print("\n[STEP 5/5] Evaluating Model & Saving Reports...")
    evaluate_and_save_confusion_matrix(model, val_gen, ordered_classes, reports_dir)
    plot_and_save_metrics(history, history_fine, reports_dir)

    # Final save confirmation
    model.save(output_model_path)
    print(f"\n[SUCCESS] Final model successfully saved to: {output_model_path}")
    print(f"[SUCCESS] Class names saved to: {output_classes_path}")
    print("\nTraining completed successfully!")


if __name__ == "__main__":
    main()
