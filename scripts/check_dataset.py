import os

DATA_DIR = "data"
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
TRAIN_DIR = os.path.join(PROCESSED_DIR, "train")
VAL_DIR = os.path.join(PROCESSED_DIR, "validation")
TEST_DIR = os.path.join(PROCESSED_DIR, "test")

EXPECTED_CLASSES = {"plastic", "paper", "metal", "glass", "organic"}

def check_dataset():
    print("Checking dataset integrity...")
    
    splits = {"train": TRAIN_DIR, "validation": VAL_DIR, "test": TEST_DIR}
    
    all_good = True
    
    for split_name, split_path in splits.items():
        if not os.path.exists(split_path):
            print(f"❌ {split_name} split directory missing.")
            all_good = False
            continue
            
        print(f"[OK] {split_name} split exists")
        
        classes_found = set(os.listdir(split_path))
        if classes_found != EXPECTED_CLASSES:
            print(f"[FAIL] {split_name} split classes mismatch. Expected {EXPECTED_CLASSES}, found {classes_found}")
            all_good = False
        else:
            print(f"[OK] 5 classes found in {split_name}")
            
        # Check if directories have files
        for c in EXPECTED_CLASSES:
            c_dir = os.path.join(split_path, c)
            if not os.path.exists(c_dir) or len(os.listdir(c_dir)) == 0:
                print(f"[FAIL] Class {c} in {split_name} is empty or missing.")
                all_good = False

    if os.path.exists(os.path.join(DATA_DIR, "metadata", "corrupted_images.csv")):
        print(f"[OK] corrupted images handled and metadata created.")
    else:
        print(f"[WARN] Corrupted images metadata missing.")
        
    if os.path.exists(os.path.join(DATA_DIR, "metadata", "duplicates.csv")):
        print(f"[OK] duplicates handled and metadata created.")
    else:
        print(f"[WARN] Duplicates metadata missing.")
        
    if all_good:
        print("\nDATASET STATUS: READY FOR TRAINING")
    else:
        print("\nDATASET STATUS: FAILED CHECKS")

if __name__ == "__main__":
    check_dataset()
