"""
Grad-CAM (Gradient-weighted Class Activation Mapping) for Fruit Quality Classification.
Generates explainable visual heatmaps highlighting fruit surface regions that
influenced the deep learning prediction.
"""

import os
import uuid
import numpy as np
from PIL import Image

try:
    import matplotlib.cm as cm
except ImportError:
    cm = None

import tensorflow as tf
from config import Config
from model.predictor import load_active_model


def _preprocess_for_gradcam(img_path):
    """Loads and normalizes image for MobileNetV2 Grad-CAM."""
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    if w != h:
        max_dim = max(w, h)
        padded = Image.new("RGB", (max_dim, max_dim), (255, 255, 255))
        padded.paste(img, ((max_dim - w) // 2, (max_dim - h) // 2))
        img = padded

    img_resized = img.resize((224, 224), Image.Resampling.LANCZOS)
    arr = np.array(img_resized, dtype=np.float32)
    # MobileNetV2 normalization: [-1, 1]
    norm_arr = (arr / 127.5) - 1.0
    return np.expand_dims(norm_arr, axis=0), np.array(img_resized)


def generate_gradcam(img_path: str, model_path: str, predicted_class_idx: int) -> str:
    """
    Computes Grad-CAM heatmap and superimposes it onto the original fruit image.
    Returns filename of saved heatmap image in generated folder, or None if unavailable.
    """
    if cm is None:
        return None

    try:
        model = load_active_model(model_path)
        img_array, original_img = _preprocess_for_gradcam(img_path)

        base_model = None
        conv_layer = None

        for layer in model.layers:
            if hasattr(layer, "layers"):
                base_model = layer
                for sub in reversed(layer.layers):
                    if "conv" in sub.name.lower() or "out_relu" in sub.name.lower():
                        conv_layer = sub
                        break
            elif "conv" in layer.name.lower():
                conv_layer = layer
                break

        if conv_layer is None:
            return None

        if base_model is not None:
            sub_grad_model = tf.keras.Model(
                inputs=base_model.input,
                outputs=[conv_layer.output, base_model.output]
            )
            top_layers = model.layers[1:]
            with tf.GradientTape() as tape:
                inputs = tf.cast(img_array, tf.float32)
                conv_out, base_out = sub_grad_model(inputs)
                tape.watch(conv_out)
                x = base_out
                for l in top_layers:
                    x = l(x)
                class_score = x[:, predicted_class_idx]

            grads = tape.gradient(class_score, conv_out)
        else:
            grad_model = tf.keras.Model(
                inputs=model.inputs,
                outputs=[conv_layer.output, model.output]
            )
            with tf.GradientTape() as tape:
                inputs = tf.cast(img_array, tf.float32)
                conv_out, preds = grad_model(inputs)
                class_score = preds[:, predicted_class_idx]
            grads = tape.gradient(class_score, conv_out)

        if grads is None:
            return None

        pooled_grads = tf.reduce_mean(grads[0], axis=(0, 1))
        conv_output = conv_out[0]
        heatmap = conv_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap_np = heatmap.numpy()

        # Resize heatmap
        heatmap_img = Image.fromarray(np.uint8(255 * heatmap_np)).resize((224, 224), Image.Resampling.LANCZOS)
        heatmap_arr = np.array(heatmap_img)

        # Apply colormap
        colormap = cm.jet(heatmap_arr / 255.0)[..., :3]
        heatmap_colored = np.uint8(colormap * 255)

        # Superimpose
        superimposed = (heatmap_colored * 0.4 + original_img * 0.6).astype(np.uint8)

        # Save
        unique_filename = f"gradcam_{uuid.uuid4().hex}.jpg"
        save_path = os.path.join(Config.GENERATED_FOLDER, unique_filename)
        os.makedirs(Config.GENERATED_FOLDER, exist_ok=True)
        Image.fromarray(superimposed).save(save_path, quality=92)

        return unique_filename

    except Exception as e:
        print(f"[gradcam] Grad-CAM generation note: {e}")
        return None
