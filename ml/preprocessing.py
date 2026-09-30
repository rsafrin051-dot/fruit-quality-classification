"""
Data preprocessing and augmentation pipeline for Fruit Quality Classification.
Supports flexible dataset structures (train/val split or single directory split),
MobileNetV2 normalization, and data augmentation.
"""

import os
from typing import Tuple, List, Dict

# Standard image dimensions for MobileNetV2
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def mobilenet_preprocess(x):
    """
    Normalizes image array to [-1, 1] range as expected by MobileNetV2:
    f(x) = (x / 127.5) - 1.0
    """
    return (x / 127.5) - 1.0


def preprocess_single_image(img_path: str, target_size: Tuple[int, int] = IMG_SIZE):
    """
    Loads, resizes, and preprocesses a single image file for model inference.
    Returns batch array of shape (1, 224, 224, 3) with values in [-1, 1].
    """
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Image not found: {img_path}")

    from PIL import Image
    import numpy as np

    with Image.open(img_path) as img:
        img = img.convert("RGB")
        img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
        arr = np.array(img_resized, dtype=np.float32)
        arr = mobilenet_preprocess(arr)
        return np.expand_dims(arr, axis=0)


def scan_dataset_structure(dataset_dir: str) -> Dict[str, any]:
    """
    Inspects dataset layout and returns paths and class distribution.
    Supports:
      1) dataset/train/<classes> and dataset/validation/<classes> (or val/)
      2) dataset/<classes> (flat structure with classes as subfolders)
    """
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"Dataset directory '{dataset_dir}' does not exist.")

    entries = [d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))]
    
    has_train = "train" in entries
    has_val = "validation" in entries or "val" in entries
    val_name = "validation" if "validation" in entries else ("val" if "val" in entries else None)

    if has_train and has_val:
        train_dir = os.path.join(dataset_dir, "train")
        val_dir = os.path.join(dataset_dir, val_name)
        classes = sorted([d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))])
        
        distribution = {"train": {}, "validation": {}}
        for cls in classes:
            train_cls_dir = os.path.join(train_dir, cls)
            val_cls_dir = os.path.join(val_dir, cls)
            train_count = len([f for f in os.listdir(train_cls_dir) if os.path.splitext(f.lower())[1] in VALID_EXTENSIONS]) if os.path.exists(train_cls_dir) else 0
            val_count = len([f for f in os.listdir(val_cls_dir) if os.path.splitext(f.lower())[1] in VALID_EXTENSIONS]) if os.path.exists(val_cls_dir) else 0
            distribution["train"][cls] = train_count
            distribution["validation"][cls] = val_count

        return {
            "mode": "split_folders",
            "train_dir": train_dir,
            "val_dir": val_dir,
            "classes": classes,
            "distribution": distribution
        }
    else:
        # Flat structure: each subfolder is a class
        classes = sorted(entries)
        distribution = {}
        for cls in classes:
            cls_dir = os.path.join(dataset_dir, cls)
            count = len([f for f in os.listdir(cls_dir) if os.path.splitext(f.lower())[1] in VALID_EXTENSIONS])
            distribution[cls] = count

        return {
            "mode": "single_folder",
            "dataset_dir": dataset_dir,
            "classes": classes,
            "distribution": distribution
        }


def create_data_generators(
    dataset_dir: str,
    img_size: Tuple[int, int] = IMG_SIZE,
    batch_size: int = BATCH_SIZE,
    validation_split: float = 0.2
):
    """
    Creates training and validation data generators with data augmentation.
    Augmentation includes:
      - Small rotation (up to 20 deg)
      - Width / Height shift (up to 15%)
      - Zoom (up to 15%)
      - Horizontal flip
    Does not use severe color distortions that could obscure fresh vs rotten signs.
    """
    import tensorflow as tf
    from tensorflow.keras.preprocessing.image import ImageDataGenerator

    info = scan_dataset_structure(dataset_dir)
    classes = info["classes"]

    if not classes:
        raise ValueError(f"No valid class subdirectories found in '{dataset_dir}'.")

    train_datagen = ImageDataGenerator(
        preprocessing_function=mobilenet_preprocess,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        zoom_range=0.15,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=validation_split if info["mode"] == "single_folder" else 0.0
    )

    val_datagen = ImageDataGenerator(
        preprocessing_function=mobilenet_preprocess,
        validation_split=validation_split if info["mode"] == "single_folder" else 0.0
    )

    if info["mode"] == "split_folders":
        train_gen = train_datagen.flow_from_directory(
            info["train_dir"],
            target_size=img_size,
            batch_size=batch_size,
            class_mode='categorical',
            shuffle=True
        )
        val_gen = val_datagen.flow_from_directory(
            info["val_dir"],
            target_size=img_size,
            batch_size=batch_size,
            class_mode='categorical',
            shuffle=False
        )
    else:
        train_gen = train_datagen.flow_from_directory(
            info["dataset_dir"],
            target_size=img_size,
            batch_size=batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True
        )
        val_gen = val_datagen.flow_from_directory(
            info["dataset_dir"],
            target_size=img_size,
            batch_size=batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )

    index_to_class = {v: k for k, v in train_gen.class_indices.items()}
    ordered_classes = [index_to_class[i] for i in range(len(index_to_class))]

    return train_gen, val_gen, ordered_classes, train_gen.class_indices
