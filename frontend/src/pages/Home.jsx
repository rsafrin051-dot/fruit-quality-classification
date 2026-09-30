import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ShieldCheck, Zap, 
  Layers, CheckCircle, Database, Eye, Cpu
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container animate-fade-in">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-badge animate-slide-up">
          <span className="badge-dot"></span>
          FINAL YEAR COLLEGE PROJECT &bull; REEMA SAFRIN H
        </div>

        <h1 className="hero-title animate-slide-up">
          Intelligent Fruit Quality <br />
          <span className="hero-gradient-text">Classification System</span>
        </h1>

        <p className="hero-subtitle animate-slide-up">
          An automated deep learning framework leveraging <strong>MobileNetV2 Transfer Learning</strong> and <strong>Explainable AI (Grad-CAM)</strong> to accurately classify produce into <strong>Fresh</strong> or <strong>Rotten</strong> with real-time confidence scores and storage recommendations.
        </p>

        {/* Floating Fruit Tags */}
        <div className="fruit-tags-row">
          <span className="fruit-tag tag-apple">🍎 Crisp Apple</span>
          <span className="fruit-tag tag-banana">🍌 Ripe Banana</span>
          <span className="fruit-tag tag-orange">🍊 Sweet Orange</span>
          <span className="fruit-tag tag-berry">🍓 Fresh Strawberry</span>
          <span className="fruit-tag tag-xai">🔬 Grad-CAM Heatmaps</span>
        </div>

        <div className="hero-actions">
          <button 
            onClick={() => navigate('/predict')} 
            className="btn btn-primary hero-btn-main"
          >
            <Sparkles size={18} /> Start Fruit Inspection <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-secondary hero-btn-sub"
          >
            View Freshness Analytics
          </button>
        </div>

        {/* Quick Tech Specs Bar in shades of Blue */}
        <div className="tech-specs-bar glass-panel">
          <div className="spec-item">
            <Cpu size={18} className="spec-icon text-sky-bright" />
            <div>
              <span className="spec-label">Backbone</span>
              <span className="spec-value">MobileNetV2</span>
            </div>
          </div>
          <div className="spec-divider"></div>
          <div className="spec-item">
            <CheckCircle size={18} className="spec-icon text-sky-main" />
            <div>
              <span className="spec-label">Target Classes</span>
              <span className="spec-value">Fresh / Rotten</span>
            </div>
          </div>
          <div className="spec-divider"></div>
          <div className="spec-item">
            <Eye size={18} className="spec-icon text-sky-cyan" />
            <div>
              <span className="spec-label">Explainability</span>
              <span className="spec-value">Grad-CAM XAI</span>
            </div>
          </div>
          <div className="spec-divider"></div>
          <div className="spec-item">
            <Database size={18} className="spec-icon text-sky-cobalt" />
            <div>
              <span className="spec-label">Persistence</span>
              <span className="spec-value">SQLite Database</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-kicker">DEEP VISION ENGINEERING</span>
          <h2>Deep Learning Architecture for Produce Assessment</h2>
          <p>Engineered for high accuracy, low latency, and transparent surface inspection in produce sorting.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper sky">
              <Zap size={26} />
            </div>
            <h3>MobileNetV2 Feature Extractor</h3>
            <p>
              Leverages depthwise separable convolutions and inverted residual bottlenecks, delivering rapid inference speeds ideal for edge and mobile produce sorting.
            </p>
            <div className="feature-meta">
              <span>Resolution: 224x224 px</span> &bull; <span>Optimizer: Adam</span>
            </div>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper cyan">
              <ShieldCheck size={26} />
            </div>
            <h3>Explainable AI via Grad-CAM</h3>
            <p>
              Generates 2D activation heatmaps overlaying input images to highlight the exact visual cues (bruises, discoloration, skin integrity) guiding model decisions.
            </p>
            <div className="feature-meta">
              <span>Visual Heatmaps</span> &bull; <span>Transparent Decisions</span>
            </div>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper cobalt">
              <Sparkles size={26} />
            </div>
            <h3>Produce Safety & Storage Guide</h3>
            <p>
              Provides automated edibility determinations, estimated remaining shelf-life, and tailored temperature/humidity storage instructions for consumers.
            </p>
            <div className="feature-meta">
              <span>Actionable Tips</span> &bull; <span>Waste Reduction</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STAGE PIPELINE WORKFLOW */}
      <section className="workflow-section glass-panel">
        <div className="section-header">
          <span className="section-kicker">END-TO-END PIPELINE</span>
          <h2>Automated Quality Assessment Process</h2>
          <p>From visual produce capture to explainable classification and SQLite database logging.</p>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <div className="step-badge step-1">01</div>
            <h4>Image Capture</h4>
            <p>Fruit photo uploaded from device or captured in real time via live camera.</p>
          </div>
          
          <div className="workflow-step-card">
            <div className="step-badge step-2">02</div>
            <h4>Preprocessing</h4>
            <p>Image standardized to 224x224 RGB format with tensor normalization.</p>
          </div>
          
          <div className="workflow-step-card">
            <div className="step-badge step-3">03</div>
            <h4>Neural Inference</h4>
            <p>MobileNetV2 extracts deep morphological features and computes probabilities.</p>
          </div>
          
          <div className="workflow-step-card">
            <div className="step-badge step-4">04</div>
            <h4>Grad-CAM & Logging</h4>
            <p>Generates attention heatmap, issues storage advice, and logs record to SQLite.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="cta-banner glass-panel">
        <div className="cta-content">
          <h3>Ready to evaluate fruit quality?</h3>
          <p>Upload a fruit photograph or capture one live using your camera to receive an instant freshness verdict.</p>
        </div>
        <button 
          onClick={() => navigate('/predict')} 
          className="btn btn-primary cta-btn"
        >
          Classify Fruit Now <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};

export default Home;
