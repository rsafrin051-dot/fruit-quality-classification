import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

DATA_DIR = "data"
METADATA_DIR = os.path.join(DATA_DIR, "metadata")
REPORTS_DIR = "reports"

os.makedirs(REPORTS_DIR, exist_ok=True)

def plot_class_distribution():
    print("Plotting class distribution...")
    df = pd.read_csv(os.path.join(METADATA_DIR, 'class_distribution.csv'))
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Class', y='Count', data=df, palette='viridis')
    plt.title('Waste Category Distribution')
    plt.ylabel('Number of Images')
    plt.xlabel('Category')
    plt.savefig(os.path.join(REPORTS_DIR, 'class_distribution.png'))
    plt.close()

def plot_image_size_distribution():
    print("Plotting image size distribution...")
    df = pd.read_csv(os.path.join(METADATA_DIR, 'image_dimensions.csv'))
    plt.figure(figsize=(10, 6))
    sns.scatterplot(x='width', y='height', hue='class', data=df, alpha=0.6, palette='Set2')
    plt.title('Image Size Distribution by Class')
    plt.xlabel('Width (pixels)')
    plt.ylabel('Height (pixels)')
    plt.savefig(os.path.join(REPORTS_DIR, 'image_size_distribution.png'))
    plt.close()

if __name__ == "__main__":
    plot_class_distribution()
    plot_image_size_distribution()
    print("Visualizations saved to reports directory.")
