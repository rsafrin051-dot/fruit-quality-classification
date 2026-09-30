import os
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
import numpy as np
import random

DATA_DIR = "data"
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
TRAIN_DIR = os.path.join(PROCESSED_DIR, "train")
REPORTS_DIR = "reports"

def preview_augmentations():
    print("Generating augmentation previews...")
    # Find a random image from the train directory
    classes = os.listdir(TRAIN_DIR)
    random_class = random.choice(classes)
    class_dir = os.path.join(TRAIN_DIR, random_class)
    images = os.listdir(class_dir)
    random_image = random.choice(images)
    img_path = os.path.join(class_dir, random_image)
    
    print(f"Using image {img_path} for preview.")
    
    img = load_img(img_path, target_size=(224, 224))
    x = img_to_array(img)
    x = np.expand_dims(x, axis=0)
    
    # Define augmentation parameters
    datagen = ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    
    plt.figure(figsize=(12, 8))
    
    # Original image
    plt.subplot(3, 3, 1)
    plt.imshow(img)
    plt.title("Original")
    plt.axis('off')
    
    # Generate 8 augmentations
    i = 2
    for batch in datagen.flow(x, batch_size=1):
        plt.subplot(3, 3, i)
        plt.imshow(batch[0].astype('uint8'))
        plt.title(f"Augmented {i-1}")
        plt.axis('off')
        i += 1
        if i > 9:
            break
            
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, 'augmentation_examples.png'))
    plt.close()
    print("Augmentation preview saved to reports/augmentation_examples.png.")

if __name__ == "__main__":
    preview_augmentations()
