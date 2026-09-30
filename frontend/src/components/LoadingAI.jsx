import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, Sparkles, Database, Eye, Cpu } from 'lucide-react';
import './LoadingAI.css';

const LoadingAI = () => {
  const [stage, setStage] = useState(0);

  const stages = [
    { text: "Fruit image received securely", icon: Upload },
    { text: "Resizing to 224x224 & normalizing tensor", icon: Camera },
    { text: "Executing MobileNetV2 Deep Learning inference", icon: Cpu },
    { text: "Generating Grad-CAM attention heatmap", icon: Eye },
    { text: "Persisting classification record to SQLite", icon: Database }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 700);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-ai-container glass-panel">
      <div className="loading-ai-header">
        <div className="loading-spinner-wrapper">
          <Loader2 className="spinner" size={36} />
        </div>
        <h3>Evaluating Produce Freshness...</h3>
        <p>MobileNetV2 neural network is extracting fruit surface features</p>
      </div>
      
      <div className="loading-stages">
        {stages.map((s, index) => {
          const Icon = s.icon;
          const isCompleted = index < stage;
          const isActive = index === stage;
          
          return (
            <div 
              key={index} 
              className={`loading-stage ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${index > stage ? 'pending' : ''}`}
            >
              <div className="stage-icon-wrapper">
                {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span className="stage-text">{s.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingAI;
