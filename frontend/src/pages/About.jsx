import React from 'react';
import { 
  Sparkles, BookOpen, Layers, CheckCircle, 
  Cpu, Database, ShieldCheck, Award, FileText, Code2
} from 'lucide-react';

const About = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* HEADER CARD */}
      <div className="glass-panel" style={{ padding: '36px 32px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '68px',
            height: '68px',
            background: 'linear-gradient(135deg, var(--fruit-fresh) 0%, var(--fruit-citrus-vibrant) 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px var(--fruit-fresh-glow)',
            flexShrink: 0
          }}>
            <Sparkles size={34} />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(34, 197, 94, 0.12)',
              color: 'var(--fruit-fresh)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: '8px'
            }}>
              <Award size={13} /> FINAL YEAR ACADEMIC PROJECT
            </div>
            <h1 style={{ fontSize: '2.2rem', margin: 0 }}>REEMA SAFRIN H</h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              Fruit Quality Classification & Explainable Spoilage Detection via Deep Transfer Learning
            </p>
          </div>
        </div>
      </div>

      {/* PROJECT ABSTRACT */}
      <div className="glass-panel" style={{ padding: '36px 32px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '14px' }}>Project Abstract & Objectives</h2>
        <p style={{ fontSize: '0.98rem', lineHeight: 1.8, color: 'var(--text-main)', marginBottom: '16px' }}>
          Post-harvest fruit loss poses significant economic and environmental burdens across the agricultural supply chain. 
          This project introduces an end-to-end automated computer vision system utilizing <strong>MobileNetV2 Transfer Learning</strong> to evaluate agricultural produce quality, differentiating between <strong>Fresh</strong> and <strong>Rotten</strong> specimens in real time.
        </p>
        <p style={{ fontSize: '0.98rem', lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>
          To enhance model trust and auditability, the system embeds <strong>Grad-CAM (Gradient-weighted Class Activation Mapping)</strong>, visually pinpointing the exact surface anomalies, fungal lesions, and skin degradation regions informing each quality verdict. All inspection records are logged into an ACID-compliant SQLite database for longitudinal shelf-life monitoring.
        </p>

        {/* 3 CORE PILLARS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginTop: '28px' }}>
          <div style={{ padding: '20px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fruit-fresh)', margin: '0 0 8px 0', fontSize: '1.05rem' }}>
              <Cpu size={20} /> Deep Transfer Learning
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Pre-trained MobileNetV2 weights fine-tuned with dense classification layers, global average pooling, dropout regularization, and the Adam optimizer.
            </p>
          </div>

          <div style={{ padding: '20px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fruit-citrus-vibrant)', margin: '0 0 8px 0', fontSize: '1.05rem' }}>
              <ShieldCheck size={20} /> Explainable AI (Grad-CAM)
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Visual activation heatmaps computed from the final convolutional feature maps, uncovering the discriminatory regions influencing freshness assessments.
            </p>
          </div>

          <div style={{ padding: '20px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fruit-harvest)', margin: '0 0 8px 0', fontSize: '1.05rem' }}>
              <Database size={20} /> Full-Stack Persistence
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Flask REST backend with SQLite relational database logging, paired with a responsive React + Vite frontend for seamless multi-device inspection.
            </p>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS TABLE */}
      <div className="glass-panel" style={{ padding: '36px 32px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>System Architecture & Technical Stack</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>Deep Learning Framework</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-main)' }}>TensorFlow 2.x & Keras 3</strong>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>Model Architecture</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-main)' }}>MobileNetV2 (224x224 RGB)</strong>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>Backend Runtime</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-main)' }}>Python 3.14 + Flask REST API</strong>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>Frontend UI</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-main)' }}>React 18 + Vite + Lucide</strong>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>Database Storage</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-main)' }}>SQLite (fruit_quality.db)</strong>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>Visualization & Analytics</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-main)' }}>Recharts + Grad-CAM Heatmaps</strong>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '28px', paddingTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          College Project Submission &bull; Developed by <strong>Reema Safrin H</strong>
        </div>
      </div>
    </div>
  );
};

export default About;
