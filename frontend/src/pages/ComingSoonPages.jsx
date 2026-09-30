import React from 'react';
import { Layers, Leaf, FileBox, Settings as SettingsIcon, Info } from 'lucide-react';

const PageHeader = ({ title, description, icon: Icon }) => (
  <div className="page-header glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div className="icon-container" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: 'var(--primary-color)' }}>
      <Icon size={40} />
    </div>
    <div>
      <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{title}</h1>
      <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>{description}</p>
    </div>
  </div>
);

const ComingSoonContent = () => (
  <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
    <div style={{
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '2rem',
      animation: 'pulse 2s infinite',
      boxShadow: '0 0 20px rgba(var(--primary-color-rgb), 0.5)'
    }}>
      <SettingsIcon size={40} color="white" className="animate-spin" style={{ animationDuration: '3s' }} />
    </div>
    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      Under Construction
    </h2>
    <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', opacity: 0.8, lineHeight: 1.6 }}>
      We are actively working on building this feature. Check back soon for exciting updates and a completely new experience.
    </p>
  </div>
);

export const Models = () => (
  <div className="animate-fade-in" style={{ padding: '2rem' }}>
    <PageHeader title="Model Performance" description="Analytics and metrics for AI classification models" icon={Layers} />
    <ComingSoonContent />
  </div>
);

export const WasteGuide = () => (
  <div className="animate-fade-in" style={{ padding: '2rem' }}>
    <PageHeader title="Waste Guide" description="Comprehensive encyclopedia on waste segregation and disposal" icon={Leaf} />
    <ComingSoonContent />
  </div>
);

export const BatchAnalysis = () => (
  <div className="animate-fade-in" style={{ padding: '2rem' }}>
    <PageHeader title="Batch Analysis" description="Process multiple images and get aggregated statistics" icon={FileBox} />
    <ComingSoonContent />
  </div>
);

export const Settings = () => (
  <div className="animate-fade-in" style={{ padding: '2rem' }}>
    <PageHeader title="System Settings" description="Configure application preferences and AI parameters" icon={SettingsIcon} />
    <ComingSoonContent />
  </div>
);

export const About = () => (
  <div className="animate-fade-in" style={{ padding: '2rem' }}>
    <PageHeader title="About SmartWaste AI" description="Learn more about our mission and technology" icon={Info} />
    <ComingSoonContent />
  </div>
);
