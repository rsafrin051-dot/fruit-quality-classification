# 🍎 REEMA SAFRIN H – FRUIT QUALITY CLASSIFICATION

An **Automated Fruit Quality Classification & Spoilage Detection System** utilizing **Deep Learning (MobileNetV2 Transfer Learning)**, Explainable AI (Grad-CAM), a lightweight **Flask REST API**, an **SQLite** database, and a modern **React + Vite** frontend.

---

## 1. Project Overview

Fruit quality assessment is a critical operation in agricultural supply chains, supermarket distribution, and food safety monitoring. Manual visual inspection is labor-intensive, error-prone, and inconsistent.

This project delivers an end-to-end, full-stack AI web solution that enables users to upload or capture a photo of a fruit (e.g., Apple, Banana, Orange) and instantly determines whether the fruit is **FRESH** or **ROTTEN**, displaying:
- Quality verdict (**FRESH** / **ROTTEN**)
- Prediction confidence percentage & level (High, Moderate, Low)
- Produce identification (Apple, Banana, Orange, etc.)
- Explainable AI (XAI) Grad-CAM visual attention heatmaps
- Actionable food safety, storage recommendations, and estimated shelf-life
- Automated logging into an SQLite database
- Interactive quality analytics dashboard with dynamic freshness charts

---

## 2. Key Features

- **Transfer Learning Backbone:** MobileNetV2 pre-trained on ImageNet for lightweight, high-speed, and high-accuracy visual feature extraction.
- **Explainable AI (Grad-CAM):** Generates gradient-weighted class activation heatmaps so users and evaluators can visually understand which surface regions influenced the AI's decision.
- **Dynamic Class Configuration:** Centralized class definition (`["Fresh", "Rotten"]`) dynamically configurable for multi-fruit categories (e.g. `Apple_Fresh`, `Banana_Rotten`) via `models/class_names.json`.
- **Produce Storage Guidance:** Generates consumer safety verdicts, shelf-life forecasts, and refrigeration advice.
- **SQLite Database Layer:** Lightweight, serverless persistence tracking prediction history, confidence scores, and timestamps.
- **Real-Time Quality Dashboard:** Interactive Doughnut and Bar charts showing produce freshness distributions, rot percentages, and recent scans.
- **Academic-Grade UI:** Responsive React SPA built with Vite, Lucide icons, and Recharts without unnecessary authentication roadblocks.
- **Downloadable Assessment Reports:** Generates standalone HTML inspection reports for record-keeping.

---

## 3. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Deep Learning** | TensorFlow / Keras 3 | MobileNetV2 transfer learning, Grad-CAM XAI |
| **Backend API** | Python / Flask | REST API, Werkzeug file security, CORS enabled |
| **Database** | SQLite 3 | Embedded zero-configuration SQL database |
| **Frontend UI** | React 19 / Vite | Fast development, modular components, responsive design |
| **Visualization** | Recharts & Lucide | Doughnut charts, confidence bar graphs, modern icons |
| **Image Processing** | Pillow (PIL) & NumPy | 224x224 aspect-ratio padding, Lanczos interpolation |

---

## 4. System Architecture & Workflow

```text
  Dataset Collection
         ↓
  Data Preprocessing (Resize 224x224, [-1, 1] Normalization)
         ↓
  Data Augmentation (Flip, Rotation, Zoom, Shifts)
         ↓
  MobileNetV2 Transfer Learning (ImageNet Weights)
         ↓
  Dense Classification Head Training & Fine-Tuning
         ↓
  Model Evaluation (Accuracy, Precision, Recall, F1, Confusion Matrix)
         ↓
  Model Artifact Saved (models/fruit_quality_model.keras)
         ↓
┌────────────────────────────────────────────────────────┐
│                   Flask REST Backend                   │
│   POST /api/predict     GET /api/dashboard/stats       │
│   GET /api/predictions  GET /api/health                │
└────────────────────────────────────────────────────────┘
         ↕ HTTP / JSON
┌────────────────────────────────────────────────────────┐
│                   React + Vite UI                      │
│   Image Upload → Preview → Predict → History → Stats   │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│               SQLite Persistence Layer                 │
│             (backend/database/fruit_quality.db)        │
└────────────────────────────────────────────────────────┘
```

---

## 5. Dataset Architecture

The project supports flexible dataset directory structures:

### Structure A: Split Folders (Recommended)
```text
dataset/
├── train/
│   ├── Fresh/
│   └── Rotten/
└── validation/
    ├── Fresh/
    └── Rotten/
```

### Structure B: Flat Directory (Auto-Split 80/20)
```text
dataset/
├── Fresh/
└── Rotten/
```

### Structure C: Fruit-Specific Classes
```text
dataset/
├── Apple_Fresh/
├── Apple_Rotten/
├── Banana_Fresh/
├── Banana_Rotten/
├── Orange_Fresh/
└── Orange_Rotten/
```

> **Note:** Sample test images are included under `dataset/samples/` (`fresh_apple.jpg`, `rotten_fruit.jpg`) for immediate testing.

---

## 6. Machine Learning Model

- **Architecture:** MobileNetV2 (Transfer Learning)
- **Input Dimensions:** `(224, 224, 3)`
- **Preprocessing:** Normalization to $[-1, 1]$ via $f(x) = \frac{x}{127.5} - 1.0$
- **Feature Extractor:** Pre-trained ImageNet base frozen initially
- **Classification Head:**
  - `GlobalAveragePooling2D()`
  - `BatchNormalization()`
  - `Dense(256, activation='relu')`
  - `Dropout(0.4)`
  - `Dense(num_classes, activation='softmax')`
- **Optimizer:** Adam ($\alpha = 0.001$, fine-tuning $\alpha = 0.0001$)
- **Artifacts Saved:**
  - `models/fruit_quality_model.keras`: Trained model file
  - `models/class_names.json`: Dynamic class mapping

---

## 7. Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### Clone or Open Directory
```powershell
cd "c:\Users\LENOVO\Desktop\fruit classification"
```

### Backend Dependencies Installation
```powershell
pip install -r backend/requirements.txt
```

### Frontend Dependencies Installation
```powershell
cd frontend
npm install
cd ..
```

---

## 8. Model Training

Training is executed as a dedicated standalone process (not automatically during server boot):

```powershell
python ml/train_model.py --dataset dataset --epochs 10 --batch_size 32
```

### CLI Arguments:
- `--dataset`: Path to fruit image dataset folder (default: `dataset`)
- `--epochs`: Epochs for training top classification head (default: `10`)
- `--fine_tune_epochs`: Epochs for fine-tuning upper layers (default: `5`)
- `--batch_size`: Mini-batch size (default: `32`)
- `--output_model`: Target save destination (default: `models/fruit_quality_model.keras`)

### Standalone Model Evaluation:
```powershell
python ml/evaluate_model.py --dataset dataset
```

---

## 9. Running the Application

### Option A: One-Click Startup (Recommended)
Double-click **`start.bat`** or run in PowerShell:
```powershell
.\start.bat
```
This automatically launches:
1. Flask Backend on `http://localhost:5000`
2. React Vite Frontend on `http://localhost:5173`

---

### Option B: Manual Startup

**Terminal 1 — Backend:**
```powershell
cd backend
python app.py
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173/`**

---

## 10. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, model status, SQLite connectivity |
| `POST` | `/api/predict` | Uploads image, runs inference, returns verdict & Grad-CAM |
| `GET` | `/api/predictions` | Paginated prediction history (`?page=1&limit=10`) |
| `DELETE` | `/api/predictions/<id>` | Deletes an individual prediction record |
| `GET` | `/api/dashboard/stats` | Aggregated metrics (total, fresh/rotten counts & percentages) |
| `GET` | `/api/model-performance` | Model file sizes and architecture specifications |
| `GET` | `/api/uploads/<filename>` | Serves uploaded fruit images |
| `GET` | `/api/generated/<filename>` | Serves generated Grad-CAM heatmaps |

---

## 11. Database Architecture (SQLite)

Database location: `backend/database/fruit_quality.db`

### Table: `predictions`
```sql
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_filename TEXT NOT NULL,
    fruit_name TEXT DEFAULT 'Fruit',
    prediction TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence REAL NOT NULL,
    confidence_level TEXT DEFAULT 'High',
    top_predictions TEXT,
    model_name TEXT,
    processing_time REAL,
    gradcam_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 12. Automated Backend Testing

Run the integration test suite verifying all 6 key functional specifications:

```powershell
python tests/test_backend.py
```

**Test Coverage:**
1. `GET /api/health` readiness
2. `POST /api/predict` missing file validation
3. `POST /api/predict` invalid file extension rejection
4. `POST /api/predict` valid image classification & confidence
5. `GET /api/predictions` paginated SQLite history retrieval
6. `GET /api/dashboard/stats` calculations

---

## 13. Screenshots & Visual Interface

- **Home Overview:** Academic presentation detailing transfer learning, explainable AI, and project goals.
- **Fruit Prediction:** Drag-and-drop file upload, live webcam capture, instant confidence bars, and Grad-CAM heatmap toggles.
- **Quality Dashboard:** Fresh vs. Rotten doughnut distribution, confidence level distribution, and recent scans.
- **Prediction History:** Paginated table containing fruit thumbnails, quality verdicts, timestamps, and record deletion.
- **About Page:** Project submission credits and technical architecture breakdown.

---

## 14. Future Enhancements

- Multi-fruit defect segmentation (identifying specific surface diseases like bitter rot or scab).
- Mobile responsive Progressive Web App (PWA) with offline caching.
- Direct IoT integration with robotic conveyor belt sorters.

---

## 15. Academic Project Details

- **Project Title:** REEMA SAFRIN H – FRUIT QUALITY CLASSIFICATION
- **Student Name:** Reema Safrin H
- **Domain:** Artificial Intelligence / Deep Learning / Full-Stack Web Development
- **Framework:** TensorFlow / Keras & Flask & React (Vite)
