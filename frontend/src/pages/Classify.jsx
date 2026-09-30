import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, X, RefreshCw, 
  Download, ShieldAlert, Sparkles, Layers,
  CheckCircle, AlertTriangle, Cpu, Clock, HelpCircle, Eye
} from 'lucide-react';
import axios from 'axios';
import LoadingAI from '../components/LoadingAI';
import { API_ENDPOINTS, API_BASE_URL } from '../services/api';
import './Classify.css';

const Classify = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // View state for Grad-CAM
  const [showGradCam, setShowGradCam] = useState(false);

  // Drag and Drop Logic
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // File Handling
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      setError("Please select a valid fruit image file (JPG, JPEG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5MB limit. Please choose a smaller image.");
      return;
    }
    
    stopCamera();
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setShowGradCam(false);
  };

  // Quick Sample Fruit Image Loader
  const loadSampleImage = async (type) => {
    try {
      setLoading(true);
      setError(null);
      const sampleUrl = type === 'fresh' 
        ? `/samples/fresh_apple.jpg`
        : `/samples/rotten_fruit.jpg`;

      const response = await fetch(sampleUrl);
      if (!response.ok) {
        throw new Error("Sample image not found.");
      }
      const blob = await response.blob();
      const file = new File([blob], type === 'fresh' ? 'fresh_apple.jpg' : 'rotten_fruit.jpg', { type: 'image/jpeg' });
      handleFile(file);
    } catch (err) {
      setError("Quick sample unavailable. Please browse an image from your device.");
    } finally {
      setLoading(false);
    }
  };

  // Camera Logic
  const startCamera = async () => {
    setError(null);
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied or unavailable on this device.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        stopCamera();
        handleFile(file);
      }, 'image/jpeg', 0.9);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Analysis / Inference Request
  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(API_ENDPOINTS.PREDICT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setTimeout(() => setResult(response.data), 800);
      } else {
        setError(response.data.error || 'Prediction failed.');
        setLoading(false);
      }
    } catch (err) {
      const serverErr = err.response?.data?.error || err.message;
      setError(`Classification failed: ${serverErr}. Please check if the Flask backend is running on port 5000.`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result || error) {
      setLoading(false);
    }
  }, [result, error]);

  const resetAll = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setShowGradCam(false);
  };

  // Generate downloadable HTML report
  const downloadReport = () => {
    if (!result) return;
    const now = new Date().toLocaleString();
    const isFresh = (result.prediction || '').toLowerCase().includes('fresh');
    const colorTheme = isFresh ? '#16a34a' : '#dc2626';

    const topRows = (result.top_predictions || []).map(p =>
      `<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">${p.category}</td><td style="padding:10px; border-bottom:1px solid #e5e7eb; font-weight:700;">${p.confidence}%</td></tr>`
    ).join('');

    const tipsHtml = (result.quality_info?.storage_tips || []).map(tip =>
      `<li style="margin-bottom:6px;">${tip}</li>`
    ).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fruit Quality Assessment Report — ${result.prediction}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 40px auto; color: #142117; line-height: 1.6; }
    .header { border-bottom: 3px solid ${colorTheme}; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display:inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; background: ${isFresh ? '#dcfce7' : '#fee2e2'}; color: ${isFresh ? '#15803d' : '#991b1b'}; }
    .card { background: #fafbf7; border: 1px solid #e2e8dc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    h1 { color: #142117; margin: 0 0 8px 0; font-size: 1.8rem; }
    h2 { color: ${colorTheme}; font-size: 2.2rem; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #e2e8dc; text-align: left; padding: 10px; font-size: 0.85rem; text-transform: uppercase; }
    footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 0.8rem; color: #56685a; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>REEMA SAFRIN H – FRUIT QUALITY CLASSIFICATION</h1>
    <p style="margin: 4px 0; color: #56685a;">Automated Produce Freshness & Spoilage Assessment</p>
    <p style="margin: 4px 0; font-size: 0.85rem; color: #89998d;">Generated on: ${now}</p>
  </div>

  <div class="card">
    <div style="font-size: 0.85rem; text-transform: uppercase; color: #56685a; font-weight: 600;">Prediction Verdict</div>
    <h2>${result.prediction}</h2>
    <div style="margin-top: 8px;">
      Fruit Identified: <strong>${result.fruit_name || 'Fruit'}</strong> &bull;
      Confidence: <strong>${result.confidence}%</strong> &bull;
      <span class="badge">${result.confidence_level} Confidence</span>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-top:0;">Class Probabilities</h3>
    <table>
      <thead><tr><th>Class</th><th>Confidence</th></tr></thead>
      <tbody>${topRows}</tbody>
    </table>
  </div>

  <div class="card">
    <h3 style="margin-top:0;">Quality Assessment & Storage Advice</h3>
    <p><strong>Edibility Status:</strong> ${result.quality_info?.status || 'N/A'}</p>
    <p><strong>Quality Rating:</strong> ${result.quality_info?.quality_level || 'N/A'}</p>
    <p><strong>Estimated Shelf Life:</strong> ${result.quality_info?.shelf_life || 'N/A'}</p>
    <p><strong>Recommended Action:</strong> ${result.quality_info?.action || 'N/A'}</p>
    <p><strong>Storage Guidelines:</strong></p>
    <ul>${tipsHtml}</ul>
  </div>

  <div class="card">
    <h3 style="margin-top:0;">Technical Specifications</h3>
    <p><strong>Backbone Architecture:</strong> MobileNetV2 Transfer Learning</p>
    <p><strong>Inference Time:</strong> ${result.processing_time}s</p>
  </div>

  <footer>
    Fruit Quality Classification Project &bull; College Final Year Submission &bull; Reema Safrin H
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FruitQuality_Report_${result.prediction}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPredictionFresh = (result?.prediction || '').toLowerCase().includes('fresh');
  const verdictThemeClass = isPredictionFresh ? 'verdict-fresh' : 'verdict-rotten';
  const verdictColor = isPredictionFresh ? 'var(--fruit-fresh)' : 'var(--fruit-rotten)';

  return (
    <div className="classify-page animate-fade-in">
      <div className="classify-header">
        <div className="classify-header-badge">
          <Sparkles size={14} /> DEEP LEARNING PRODUCE LAB
        </div>
        <h1>Fruit Quality Classification</h1>
        <p>Upload a fruit photograph or capture via camera to evaluate freshness status, surface defects, and food safety advice.</p>
      </div>

      <div className="classify-grid">
        {/* LEFT COLUMN: UPLOAD & PREVIEW */}
        <div className="classify-left">
          <div className="upload-container glass-panel">
            {!preview && !isCameraActive && !loading && (
              <div 
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input type="file" id="file-upload" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} hidden />
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    <Upload size={32} />
                  </div>
                  <h3>Drop fruit photograph here</h3>
                  <p className="dropzone-sub">Drag & drop your produce photo or browse local disk</p>
                  
                  <div className="dropzone-actions">
                    <label htmlFor="file-upload" className="btn btn-primary dropzone-browse-btn">
                      Browse Local Photo
                    </label>
                    <button className="btn btn-secondary camera-btn" onClick={startCamera}>
                      <Camera size={17} /> Live Camera
                    </button>
                  </div>
                  
                  <span className="dropzone-hint">Supported formats: JPG, PNG, WEBP (Max 5MB)</span>
                </div>
                
                {/* Instant Quick Samples */}
                <div className="sample-test-tray">
                  <span className="sample-tray-label">Quick Test Specimens:</span>
                  <div className="sample-buttons">
                    <button 
                      type="button" 
                      className="sample-chip sample-fresh" 
                      onClick={() => loadSampleImage('fresh')}
                    >
                      🍎 Fresh Apple
                    </button>
                    <button 
                      type="button" 
                      className="sample-chip sample-rotten" 
                      onClick={() => loadSampleImage('rotten')}
                    >
                      🍌 Rotten Fruit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="camera-view animate-fade-in">
                <div className="video-stream-wrapper">
                  <video ref={videoRef} autoPlay playsInline className="video-stream"></video>
                  <div className="camera-crosshairs"></div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <div className="camera-actions">
                  <button className="btn btn-secondary" onClick={stopCamera}>Cancel</button>
                  <button className="btn btn-primary" onClick={captureImage}>
                    <Camera size={18} /> Capture Photo
                  </button>
                </div>
              </div>
            )}

            {preview && !loading && (
              <div className="preview-view animate-fade-in">
                <div className="image-wrapper">
                  <img src={preview} alt="Fruit Preview" className="preview-img" />
                  <button className="remove-img-btn" onClick={resetAll} aria-label="Remove image" title="Remove image">
                    <X size={16} />
                  </button>
                  <div className="preview-tag">Input Specimen</div>
                </div>
                
                {!result && (
                  <div className="preview-actions">
                    <button className="btn btn-primary analyze-btn" onClick={handleUpload}>
                      <Sparkles size={18} /> Classify Fruit Quality
                    </button>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="loading-view">
                <LoadingAI />
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <ShieldAlert size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="responsible-ai-note glass-panel">
            <CheckCircle size={18} className="note-icon" />
            <p><strong>Inspection Advice:</strong> For optimal feature extraction by MobileNetV2, photograph produce under neutral lighting with minimal background clutter.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: INSTRUCTIONS OR RESULTS */}
        <div className="classify-right">
          {!result && !loading ? (
            <div className="instructions-card glass-panel">
              <div className="instructions-header">
                <h3>Produce Inspection Protocol</h3>
                <span className="protocol-badge">Standard Operating Procedure</span>
              </div>

              <div className="workflow-steps">
                <div className="workflow-step">
                  <div className="step-number step-1">01</div>
                  <div className="step-content">
                    <h4>Visual Capture</h4>
                    <p>Select a photograph of an apple, banana, orange, or other produce item from your local disk or live camera.</p>
                  </div>
                </div>

                <div className="workflow-step">
                  <div className="step-number step-2">02</div>
                  <div className="step-content">
                    <h4>Feature Extraction</h4>
                    <p>MobileNetV2 processes morphological textures, epidermal integrity, and surface discoloration patterns.</p>
                  </div>
                </div>

                <div className="workflow-step">
                  <div className="step-number step-3">03</div>
                  <div className="step-content">
                    <h4>Quality Scoring</h4>
                    <p>Softmax layer calculates categorical freshness probabilities and issues a high-confidence Fresh or Rotten verdict.</p>
                  </div>
                </div>

                <div className="workflow-step">
                  <div className="step-number step-4">04</div>
                  <div className="step-content">
                    <h4>Explainability & Guidance</h4>
                    <p>Generates Grad-CAM visual heatmaps, provides food safety storage guidelines, and persists assessment into SQLite.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="result-container animate-slide-up">
              
              {/* Main Result Card */}
              <div className={`result-hero glass-panel ${verdictThemeClass}`}>
                <div className="result-hero-header">
                  <span className="verdict-label-chip">PRODUCE QUALITY VERDICT</span>
                  <span className={`confidence-pill ${result.confidence_level?.toLowerCase()}`}>
                    {result.confidence_level} Confidence
                  </span>
                </div>
                
                <h2 className="detected-category">
                  {result.prediction}
                </h2>

                <div className="detected-fruit-meta">
                  <span>Identified Fruit:</span>
                  <strong className="fruit-name-badge">{result.fruit_name || 'Fruit'}</strong>
                </div>

                <div className="confidence-display">
                  <div className="conf-header-row">
                    <span>Model Confidence</span>
                    <strong className="conf-number">{result.confidence}%</strong>
                  </div>
                  <div className="conf-bar-bg">
                    <div 
                      className="conf-bar-fill" 
                      style={{ 
                        width: `${result.confidence}%`,
                        backgroundColor: verdictColor
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Explainable AI (Grad-CAM) */}
              {result.gradcam_url && (
                <div className="xai-card glass-panel">
                  <div className="card-header-flex">
                    <div className="xai-title">
                      <Eye size={18} className="xai-icon" />
                      <h4>Explainable AI (Grad-CAM)</h4>
                    </div>
                    <div className="view-toggle">
                      <button 
                        className={`toggle-btn ${!showGradCam ? 'active' : ''}`}
                        onClick={() => setShowGradCam(false)}
                      >
                        Original
                      </button>
                      <button 
                        className={`toggle-btn ${showGradCam ? 'active' : ''}`}
                        onClick={() => setShowGradCam(true)}
                      >
                        Attention Heatmap
                      </button>
                    </div>
                  </div>
                  
                  <div className="xai-image-container">
                    <img 
                      src={showGradCam ? `${API_BASE_URL}${result.gradcam_url}` : preview} 
                      alt="Model Attention Heatmap" 
                      className="xai-img" 
                    />
                    <div className="xai-overlay-tag">
                      {showGradCam ? 'Grad-CAM Activation Map' : 'Original Produce Photo'}
                    </div>
                  </div>
                  <p className="xai-caption">
                    🔥 <strong>Surface Cue Highlights:</strong> High-gradient regions indicate the specific visual cues (skin discoloration, decay spots, or healthy sheen) that guided MobileNetV2 to this classification.
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="details-grid">
                {/* Class Probabilities */}
                <div className="info-card glass-panel">
                  <div className="details-card-header">
                    <h4>Top Class Probabilities</h4>
                  </div>
                  <div className="top3-list">
                    {(result.top_predictions || []).map((pred, i) => {
                      const isItemFresh = pred.category.toLowerCase().includes('fresh');
                      const itemColor = isItemFresh ? 'var(--fruit-fresh)' : 'var(--fruit-rotten)';
                      return (
                        <div key={i} className="top3-item">
                          <span className="top3-name">{pred.category}</span>
                          <div className="top3-bar-container">
                            <div 
                              className="top3-bar" 
                              style={{
                                width: `${pred.confidence}%`,
                                backgroundColor: itemColor
                              }}
                            ></div>
                          </div>
                          <span className="top3-val">{pred.confidence}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="model-info">
                    <Cpu size={14} /> Architecture: {result.model_name || 'MobileNetV2'} &bull; <Clock size={14} /> Latency: {result.processing_time}s
                  </div>
                </div>

                {/* Quality & Storage Guidance */}
                <div className="guide-card glass-panel">
                  <div className="details-card-header">
                    <h4>Food Safety & Storage Guidelines</h4>
                  </div>
                  <div className="guide-content">
                    <div className="guide-metrics-row">
                      <div className="guide-metric">
                        <span className="label">Edibility Status</span>
                        <span className="val" style={{ color: verdictColor, fontWeight: 700 }}>
                          {result.quality_info?.status || 'Assessed'}
                        </span>
                      </div>

                      <div className="guide-metric">
                        <span className="label">Estimated Shelf Life</span>
                        <span className="val">{result.quality_info?.shelf_life || 'Standard'}</span>
                      </div>
                    </div>
                    
                    <div className="storage-action-box" style={{ borderLeftColor: verdictColor }}>
                      <h5 style={{ color: verdictColor }}>Recommended Action</h5>
                      <p>{result.quality_info?.action}</p>
                      {result.quality_info?.storage_tips && (
                        <ul className="storage-tips-list">
                          {result.quality_info.storage_tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="result-action-bar">
                <button className="btn btn-secondary" onClick={resetAll}>
                  <RefreshCw size={16} /> Classify Another Fruit
                </button>
                <button className="btn btn-primary" onClick={downloadReport}>
                  <Download size={16} /> Download Inspection Report
                </button>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Classify;
