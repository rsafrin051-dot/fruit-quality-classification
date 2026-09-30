import React, { useState, useEffect } from 'react';
import { Layers, Activity, Cpu, CheckCircle, HardDrive, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ padding: '0.75rem', background: `${color}20`, borderRadius: '0.75rem', color }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 'bold', lineHeight: 1 }}>{value}</div>
      <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.25rem' }}>{label}</div>
    </div>
  </div>
);

const ModelPerformance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/model-performance`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load model data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
        <div style={{ opacity: 0.7 }}>Loading model performance data…</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--danger)' }}>
        ⚠ {error}
        <br /><br />
        <button onClick={fetchData} style={{ padding: '0.5rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '2rem', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const models = data?.models || [];
  const catDist = stats.category_distribution || {};
  const topCategory = Object.entries(catDist).sort((a,b) => b[1]-a[1])[0];

  const CATEGORY_COLORS = {
    Glass: '#4db8ff', Metal: '#9ca3af', Organic: '#22c55e', Paper: '#fbbf24', Plastic: '#f97316',
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'var(--primary-color)' }}>
            <Layers size={40} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Model Performance</h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Live metrics from AI classification models</p>
          </div>
        </div>
        <button onClick={fetchData} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(150,150,150,0.4)', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Live Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon={Activity} label="Total Classifications" value={stats.total_predictions ?? 0} color="var(--primary-color)" />
        <StatCard icon={Cpu} label="Avg Confidence" value={`${stats.average_confidence ?? 0}%`} color="#8b5cf6" />
        <StatCard icon={CheckCircle} label="Active Model" value={data?.active_model?.replace('.keras','') || 'N/A'} color="#10b981" />
        <StatCard icon={Layers} label="Waste Classes" value={5} color="#f59e0b" />
      </div>

      {/* Category breakdown */}
      {Object.keys(catDist).length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Classification Breakdown by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(catDist).sort((a,b) => b[1]-a[1]).map(([cat, count]) => {
              const total = stats.total_predictions || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '90px', fontWeight: 600, fontSize: '0.95rem' }}>{cat}</div>
                  <div style={{ flex: 1, height: '10px', background: 'rgba(150,150,150,0.15)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: CATEGORY_COLORS[cat] || 'var(--primary-color)', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ width: '60px', textAlign: 'right', opacity: 0.8, fontSize: '0.9rem' }}>{count} ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Model inventory */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Installed Models</h3>
        {models.length === 0 ? (
          <div style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>No models found in /models directory.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(150,150,150,0.2)' }}>
                  {['Model', 'Architecture', 'File Size', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', opacity: 0.7, fontWeight: 600, fontSize: '0.875rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(150,150,150,0.08)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '1rem', opacity: 0.8 }}>{m.architecture}</td>
                    <td style={{ padding: '1rem', opacity: 0.8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <HardDrive size={14} /> {m.size_mb} MB
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600,
                        background: m.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(150,150,150,0.15)',
                        color: m.status === 'Active' ? '#10b981' : 'inherit'
                      }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelPerformance;
