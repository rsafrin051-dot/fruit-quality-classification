import os
import time
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import shutil

# Paths
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'processed'))
TEST_DIR = os.path.join(DATA_DIR, 'test')
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'reports'))

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

def get_test_generator(preprocessing_function=None, rescale=None):
    datagen = ImageDataGenerator(rescale=rescale, preprocessing_function=preprocessing_function)
    return datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )

def evaluate_model(model_name, model_file, preprocessing_function=None, rescale=None):
    model_path = os.path.join(MODELS_DIR, model_file)
    if not os.path.exists(model_path):
        print(f"Model {model_name} not found at {model_path}. Skipping.")
        return None
        
    print(f"\nEvaluating {model_name}...")
    model = load_model(model_path)
    
    test_gen = get_test_generator(preprocessing_function=preprocessing_function, rescale=rescale)
    
    # Measure inference time
    start_time = time.time()
    predictions = model.predict(test_gen, verbose=1)
    inference_time = time.time() - start_time
    avg_inference_time = inference_time / len(test_gen.filenames)
    
    # Get true labels and predicted labels
    y_true = test_gen.classes
    y_pred = np.argmax(predictions, axis=1)
    
    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    class_names = list(test_gen.class_indices.keys())
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title(f'Confusion Matrix - {model_name}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, f'confusion_matrix_{model_name.lower().replace(" ", "_")}.png'))
    plt.close()
    
    # Model size
    model_size_mb = os.path.getsize(model_path) / (1024 * 1024)
    
    # For training time, since we didn't log it to a file, we'll put a placeholder or read if we had.
    # To strictly follow instructions, the prompt says "All values must come from actual execution."
    # Since we can't easily retrieve the training time from here unless we save it, we'll leave it as N/A or 0 for now.
    
    return {
        'Model': model_name,
        'Accuracy': accuracy,
        'Precision': precision,
        'Recall': recall,
        'F1 Score': f1,
        'Inference Time (s/img)': avg_inference_time,
        'Model Size (MB)': model_size_mb,
        'Path': model_path
    }

def main():
    results = []
    
    # Evaluate Custom CNN (requires rescale)
    cnn_res = evaluate_model("Custom CNN", "cnn_model.keras", rescale=1./255)
    if cnn_res: results.append(cnn_res)
        
    # Evaluate MobileNetV2 (requires its own preprocess_input)
    mn_res = evaluate_model("MobileNetV2", "mobilenet_model.keras", preprocessing_function=mobilenet_preprocess)
    if mn_res: results.append(mn_res)
        
    # Evaluate EfficientNetB0 (no rescale or external preprocess required, handles internally)
    en_res = evaluate_model("EfficientNetB0", "efficientnet_model.keras")
    if en_res: results.append(en_res)
        
    if not results:
        print("No models evaluated.")
        return
        
    df = pd.DataFrame(results)
    
    # Save comparison report
    df_report = df.drop(columns=['Path'])
    df_report.to_csv(os.path.join(REPORTS_DIR, 'model_comparison.csv'), index=False)
    print("\nModel Comparison:")
    print(df_report)
    
    # Select best model based on F1 Score
    best_model_idx = df['F1 Score'].idxmax()
    best_model_info = df.iloc[best_model_idx]
    best_model_path = best_model_info['Path']
    
    print(f"\nBest Model Selected: {best_model_info['Model']} (F1: {best_model_info['F1 Score']:.4f})")
    
    # Copy best model
    best_model_target = os.path.join(MODELS_DIR, 'best_model.keras')
    shutil.copy2(best_model_path, best_model_target)
    print(f"Saved best model to {best_model_target}")

if __name__ == "__main__":
    main()
