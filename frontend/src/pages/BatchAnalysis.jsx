import React, { useState, useRef, useCallback } from 'react';
import { FileBox, UploadCloud, X, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const CATEGORY_COLORS = {
  Glass: '#4db8ff',
  Metal: '#9ca3af',
  Organic: '#22c55e',
  Paper: '#fbbf24',
  Plastic: '#f97316',
};

const BatchAnalysis = () => {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((incomingFiles) => {
    const imageFiles = Array.from(incomingFiles).filter(f => f.type.match('image.*'));
    const newFiles = imageFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending', // pending | processing | done | error
      result: null,
      error: null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setResults([]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const runBatch = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    const updatedFiles = files.map(f => ({ ...f, status: 'pending', result: null, error: null }));
    setFiles(updatedFiles);

    const completed = [];
    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));

      try {
        const formData = new FormData();
        formData.append('image', item.file);
        const res = await axios.post(`${API_BASE}/api/predict`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const result = res.data;
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done', result } : f));
        completed.push({ ...item, result });
      } catch (err) {
        const errMsg = err.response?.data?.error || 'Failed';
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', error: errMsg } : f));
      }

      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
    }
    setResults(completed);
    setProcessing(false);
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
    setProcessing(false);
  };

  // Compute summary stats from completed results
  const summary = results.reduce((acc, item) => {
    if (item.result) {
      const cat = item.result.category;
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});
  const totalDone = results.length;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: 'var(--primary-color)' }}>
          <FileBox size={40} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Batch Analysis</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Process multiple images and get aggregated statistics</p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className="glass-panel"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !processing && fileInputRef.current?.click()}
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          borderRadius: '1.5rem',
          border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'rgba(150,150,150,0.3)'}`,
          cursor: processing ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.2s',
          marginBottom: '2rem',
          background: isDragging ? 'rgba(var(--primary-color-rgb), 0.05)' : undefined
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{
          width: '70px', height: '70px',
          background: 'rgba(var(--primary-color-rgb), 0.1)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem auto', color: 'var(--primary-color)'
        }}>
          <UploadCloud size={36} />
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Drag & Drop images here</h2>
        <p style={{ opacity: 0.7, marginBottom: 0 }}>or click to browse &mdash; Supports JPG, PNG, WEBP</p>
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{files.length} image{files.length !== 1 ? 's' : ''} queued</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={reset}
                disabled={processing}
                style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(150,150,150,0.4)', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              >
                <RefreshCw size={16} /> Reset
              </button>
              <button
                onClick={runBatch}
                disabled={processing}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, opacity: processing ? 0.7 : 1 }}
              >
                {processing ? <><Loader2 size={16} className="spin" /> Processing… {progress}%</> : 'Run Batch Analysis'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {processing && (
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(150,150,150,0.2)', marginBottom: '1rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary-color)', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          )}

          {/* File Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {files.map(item => (
              <div key={item.id} style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(150,150,150,0.2)' }}>
                <img src={item.preview} alt={item.file.name} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.file.name}
                </div>
                {/* Status overlay */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: item.status === 'processing' ? 'rgba(0,0,0,0.5)' : item.status === 'done' ? 'rgba(16,185,129,0.15)' : item.status === 'error' ? 'rgba(239,68,68,0.15)' : 'transparent',
                  pointerEvents: 'none'
                }}>
                  {item.status === 'processing' && <Loader2 size={28} color="white" className="spin" />}
                  {item.status === 'done' && (
                    <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', background: CATEGORY_COLORS[item.result?.category] || '#888', color: 'white', padding: '2px 8px', borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {item.result?.category} {item.result?.confidence}%
                    </div>
                  )}
                  {item.status === 'error' && <AlertTriangle size={24} color="#ef4444" />}
                </div>

                {/* Remove btn */}
                {!processing && (
                  <button onClick={e => { e.stopPropagation(); removeFile(item.id); }} style={{
                    position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)',
                    border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white'
                  }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {totalDone > 0 && !processing && (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Batch Summary — {totalDone} image{totalDone !== 1 ? 's' : ''} classified</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {Object.entries(summary).map(([cat, count]) => (
              <div key={cat} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: `${CATEGORY_COLORS[cat]}20`, borderLeft: `4px solid ${CATEGORY_COLORS[cat]}` }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: CATEGORY_COLORS[cat] }}>{count}</div>
                <div style={{ fontWeight: 600 }}>{cat}</div>
                <div style={{ opacity: 0.7, fontSize: '0.875rem' }}>{Math.round((count / totalDone) * 100)}% of batch</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline spin style */}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BatchAnalysis;
