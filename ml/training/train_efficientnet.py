"""
Industry-Level EfficientNetB0 Training Script for SmartWaste AI
================================================================
Strategy to avoid under/overfitting on a small (~1100 image) dataset:
  1. Aggressive data augmentation to regularize training
  2. Two-phase training: (a) warm-up with frozen base, (b) fine-tune last N layers
  3. Label smoothing to prevent overconfident softmax
  4. L2 weight decay on classifier head
  5. Cosine-decay learning rate with warm restarts
  6. Early stopping + model checkpoint on val accuracy
  7. Class-weight balancing for any class imbalance

Run: python ml/training/train_efficientnet_v2.py
"""

import os
import time
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.callbacks import (
    EarlyStopping, ModelCheckpoint, ReduceLROnPlateau,
    CSVLogger, TensorBoard
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.utils.class_weight import compute_class_weight
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for saving plots
import matplotlib.pyplot as plt

# ─── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TRAIN_DIR   = os.path.join(BASE_DIR, 'data', 'processed', 'train')
VAL_DIR     = os.path.join(BASE_DIR, 'data', 'processed', 'validation')
TEST_DIR    = os.path.join(BASE_DIR, 'data', 'processed', 'test')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# ─── Hyperparameters ────────────────────────────────────────────────────────
IMG_SIZE   = (224, 224)
BATCH_SIZE = 32   # Faster training and smooth gradients
SEED       = 42

# Phase 1 – frozen base (feature extraction warm-up)
P1_EPOCHS  = 12
P1_LR      = 1e-3

# Phase 2 – unfreeze top layers (fine-tuning)
P2_EPOCHS  = 25
P2_LR      = 2e-4
UNFREEZE_LAYERS = 60   # Unfreeze top 60 layers of EfficientNetB0 for high accuracy

DROPOUT    = 0.3
L2_DECAY   = 1e-4
NUM_CLASSES = 5


# ─── Data Generators ────────────────────────────────────────────────────────
def get_generators():
    # Realistic augmentation tailored for waste images
    train_datagen = ImageDataGenerator(
        rotation_range=25,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.85, 1.15],
        fill_mode='nearest',
    )

    # No augmentation on validation (only rescale — but EfficientNet handles that internally)
    val_datagen = ImageDataGenerator()

    train_gen = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        seed=SEED,
        shuffle=True
    )

    val_gen = val_datagen.flow_from_directory(
        VAL_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        seed=SEED,
        shuffle=False
    )

    return train_gen, val_gen


# ─── Model Builder ──────────────────────────────────────────────────────────
def build_model(trainable_base=False, unfreeze_last=0):
    base = EfficientNetB0(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base.trainable = False

    if trainable_base and unfreeze_last > 0:
        # Unfreeze only the last N layers for fine-tuning
        for layer in base.layers[-unfreeze_last:]:
            if not isinstance(layer, layers.BatchNormalization):
                layer.trainable = True

    inp = layers.Input(shape=(224, 224, 3))
    x = base(inp, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation='relu',
                     kernel_regularizer=regularizers.l2(L2_DECAY))(x)
    x = layers.Dropout(DROPOUT)(x)
    x = layers.Dense(128, activation='relu',
                     kernel_regularizer=regularizers.l2(L2_DECAY))(x)
    x = layers.Dropout(DROPOUT / 2)(x)
    out = layers.Dense(NUM_CLASSES, activation='softmax')(x)

    model = models.Model(inp, out)
    return model


# ─── Compute class weights ───────────────────────────────────────────────────
def get_class_weights(train_gen):
    labels = train_gen.classes
    classes = np.unique(labels)
    weights = compute_class_weight('balanced', classes=classes, y=labels)
    return dict(zip(classes, weights))


# ─── Plot helpers ────────────────────────────────────────────────────────────
def plot_history(histories, filename):
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    for h, label in histories:
        axes[0].plot(h.history['accuracy'],     label=f'{label} train')
        axes[0].plot(h.history['val_accuracy'], label=f'{label} val', linestyle='--')
        axes[1].plot(h.history['loss'],         label=f'{label} train')
        axes[1].plot(h.history['val_loss'],     label=f'{label} val', linestyle='--')
    axes[0].set_title('Accuracy')
    axes[0].legend()
    axes[0].set_xlabel('Epoch')
    axes[1].set_title('Loss')
    axes[1].legend()
    axes[1].set_xlabel('Epoch')
    plt.tight_layout()
    path = os.path.join(REPORTS_DIR, filename)
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"Training curves saved to {path}")


# ─── Main ────────────────────────────────────────────────────────────────────
def train():
    print("=" * 60)
    print("SmartWaste AI — Industry-Level Model Training")
    print("=" * 60)

    train_gen, val_gen = get_generators()
    class_weights = get_class_weights(train_gen)
    print(f"\nClass weights (for balance): {class_weights}")
    print(f"Training samples  : {train_gen.samples}")
    print(f"Validation samples: {val_gen.samples}")

    best_model_path = os.path.join(MODELS_DIR, 'best_model.keras')

    # ── Phase 1: Frozen base ──────────────────────────────────────────────────
    print("\n[Phase 1] Feature extraction warm-up (frozen base)…")
    model = build_model(trainable_base=False)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=P1_LR),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=['accuracy']
    )
    model.summary()

    p1_callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=8,
                      restore_best_weights=True, verbose=1),
        ModelCheckpoint(best_model_path, monitor='val_accuracy',
                        save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=3,
                          min_lr=1e-6, verbose=1),
        CSVLogger(os.path.join(REPORTS_DIR, 'phase1_log.csv')),
    ]

    t0 = time.time()
    h1 = model.fit(
        train_gen,
        epochs=P1_EPOCHS,
        validation_data=val_gen,
        callbacks=p1_callbacks,
        class_weight=class_weights,
        verbose=1
    )
    print(f"Phase 1 done in {time.time()-t0:.1f}s | Best val_acc: {max(h1.history['val_accuracy']):.4f}")

    # ── Phase 2: Unfreeze top layers ─────────────────────────────────────────
    print(f"\n[Phase 2] Fine-tuning (unfreezing last {UNFREEZE_LAYERS} base layers)…")
    # Reload best weights from phase 1
    model = tf.keras.models.load_model(best_model_path)

    # Rebuild with partially unfrozen base
    model2 = build_model(trainable_base=True, unfreeze_last=UNFREEZE_LAYERS)
    model2.set_weights(model.get_weights())

    model2.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=P2_LR),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
        metrics=['accuracy']
    )

    p2_callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=12,
                      restore_best_weights=True, verbose=1),
        ModelCheckpoint(best_model_path, monitor='val_accuracy',
                        save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4,
                          min_lr=1e-7, verbose=1),
        CSVLogger(os.path.join(REPORTS_DIR, 'phase2_log.csv')),
    ]

    t0 = time.time()
    h2 = model2.fit(
        train_gen,
        epochs=P2_EPOCHS,
        validation_data=val_gen,
        callbacks=p2_callbacks,
        class_weight=class_weights,
        verbose=1
    )
    print(f"Phase 2 done in {time.time()-t0:.1f}s | Best val_acc: {max(h2.history['val_accuracy']):.4f}")

    # ── Evaluate on test set ──────────────────────────────────────────────────
    print("\n[Evaluation] Loading best checkpoint…")
    final_model = tf.keras.models.load_model(best_model_path)

    test_datagen = ImageDataGenerator()
    test_gen = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )

    loss, acc = final_model.evaluate(test_gen, verbose=0)
    print(f"\n{'='*60}")
    print(f"  Final TEST Accuracy : {acc * 100:.2f}%")
    print(f"  Final TEST Loss     : {loss:.4f}")
    print(f"{'='*60}")

    # ── Save plots ────────────────────────────────────────────────────────────
    plot_history(
        [(h1, 'Phase1'), (h2, 'Phase2')],
        'efficientnet_training_curves.png'
    )

    # ── Also copy to efficientnet_model.keras ────────────────────────────────
    import shutil
    shutil.copy(best_model_path, os.path.join(MODELS_DIR, 'efficientnet_model.keras'))
    print(f"\nBest model saved to: {best_model_path}")


if __name__ == "__main__":
    # Force CPU if GPU causes memory issues (remove this line if you have a good GPU)
    # os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
    train()
