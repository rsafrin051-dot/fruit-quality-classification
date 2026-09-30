import os
import shutil
import hashlib
import csv
from collections import defaultdict
from PIL import Image
import imagehash
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import sys

# Constants
SOURCE_DIR = r"c:\Users\acer\OneDrive\Pictures\Desktop\Smart Waste  AI\Real-World Garbage-Waste Classification (5 Classes)\Real-World Garbage-Waste Classification (5 Classes)"
DATA_DIR = "data"
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
METADATA_DIR = os.path.join(DATA_DIR, "metadata")

TRAIN_DIR = os.path.join(PROCESSED_DIR, "train")
VAL_DIR = os.path.join(PROCESSED_DIR, "validation")
TEST_DIR = os.path.join(PROCESSED_DIR, "test")

CLASS_MAPPING = {
    "Cam Atık": "glass",
    "Kağıt Atık": "paper",
    "Metal Atık": "metal",
    "Organik Atık": "organic",
    "Plastik Atık": "plastic"
}

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
RANDOM_SEED = 42

def compute_md5(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def prepare_dataset():
    print("Starting dataset preparation...")
    os.makedirs(METADATA_DIR, exist_ok=True)
    
    # Initialize metadata collectors
    corrupted_images = []
    duplicates = []
    image_dimensions = []
    class_counts = defaultdict(int)
    
    valid_images = [] # list of (path, label)
    seen_md5 = {}
    seen_phash = {}

    for tr_class, eng_class in CLASS_MAPPING.items():
        print(f"Processing class: {eng_class}")
        class_dir = os.path.join(SOURCE_DIR, tr_class)
        if not os.path.exists(class_dir):
            print(f"ERROR: Directory not found - {class_dir}")
            continue
            
        for filename in os.listdir(class_dir):
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue
                
            file_path = os.path.join(class_dir, filename)
            
            # Check for corruption and get dimensions
            try:
                with Image.open(file_path) as img:
                    img.verify() # Verify integrity
                with Image.open(file_path) as img:
                    width, height = img.size
                    channels = len(img.getbands())
                    # convert to RGB if needed to compute phash reliably
                    img_rgb = img.convert('RGB')
                    phash = str(imagehash.phash(img_rgb))
                    
                image_dimensions.append({
                    'filename': filename,
                    'class': eng_class,
                    'width': width,
                    'height': height,
                    'channels': channels,
                    'format': ext
                })
            except Exception as e:
                corrupted_images.append({
                    'filename': filename,
                    'path': file_path,
                    'error': str(e)
                })
                continue
                
            # Duplicate checking
            md5_hash = compute_md5(file_path)
            if md5_hash in seen_md5:
                duplicates.append({
                    'filename': filename,
                    'path': file_path,
                    'type': 'exact_md5',
                    'original': seen_md5[md5_hash]
                })
                continue
                
            if phash in seen_phash:
                duplicates.append({
                    'filename': filename,
                    'path': file_path,
                    'type': 'near_phash',
                    'original': seen_phash[phash]
                })
                continue
                
            seen_md5[md5_hash] = file_path
            seen_phash[phash] = file_path
            
            valid_images.append((file_path, eng_class))
            class_counts[eng_class] += 1

    print(f"Found {len(valid_images)} valid unique images.")
    print(f"Found {len(corrupted_images)} corrupted images.")
    print(f"Found {len(duplicates)} duplicates.")

    # Write metadata
    pd.DataFrame(corrupted_images).to_csv(os.path.join(METADATA_DIR, 'corrupted_images.csv'), index=False)
    pd.DataFrame(duplicates).to_csv(os.path.join(METADATA_DIR, 'duplicates.csv'), index=False)
    pd.DataFrame(image_dimensions).to_csv(os.path.join(METADATA_DIR, 'image_dimensions.csv'), index=False)
    
    dist_df = pd.DataFrame(list(class_counts.items()), columns=['Class', 'Count'])
    dist_df.to_csv(os.path.join(METADATA_DIR, 'class_distribution.csv'), index=False)

    # Train / Val / Test Split (70/15/15)
    print("Splitting dataset...")
    df = pd.DataFrame(valid_images, columns=['filepath', 'label'])
    
    train_df, temp_df = train_test_split(df, test_size=0.30, random_state=RANDOM_SEED, stratify=df['label'])
    val_df, test_df = train_test_split(temp_df, test_size=0.50, random_state=RANDOM_SEED, stratify=temp_df['label'])
    
    # Write split metadata
    split_dist = pd.DataFrame({
        'train': train_df['label'].value_counts(),
        'validation': val_df['label'].value_counts(),
        'test': test_df['label'].value_counts()
    }).fillna(0).astype(int)
    split_dist.to_csv(os.path.join(METADATA_DIR, 'split_distribution.csv'))

    def copy_files(split_df, target_base_dir):
        for class_name in CLASS_MAPPING.values():
            os.makedirs(os.path.join(target_base_dir, class_name), exist_ok=True)
            
        for _, row in split_df.iterrows():
            src = row['filepath']
            label = row['label']
            filename = os.path.basename(src)
            # handle potential name collisions by using a hash prefix if needed, 
            # but since they were unique in source, just copy directly.
            dst = os.path.join(target_base_dir, label, filename)
            shutil.copy2(src, dst)

    print("Copying files to processed directory...")
    copy_files(train_df, TRAIN_DIR)
    copy_files(val_df, VAL_DIR)
    copy_files(test_df, TEST_DIR)

    dataset_summary = {
        'total_original_images': sum(class_counts.values()) + len(duplicates) + len(corrupted_images),
        'valid_unique_images': len(valid_images),
        'corrupted_images': len(corrupted_images),
        'duplicates_removed': len(duplicates),
        'train_images': len(train_df),
        'val_images': len(val_df),
        'test_images': len(test_df)
    }
    pd.DataFrame([dataset_summary]).to_csv(os.path.join(METADATA_DIR, 'dataset_summary.csv'), index=False)
    
    print("Dataset preparation complete!")

if __name__ == "__main__":
    prepare_dataset()
