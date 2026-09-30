import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Layers, CheckCircle2, AlertTriangle, TrendingUp, 
  ArrowRight, RefreshCw, Sparkles, Activity, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Organic Fruit Classification Palette
  const FRESH_COLOR = '#16a34a';   // Fresh Apple Green
  const ROTTEN_COLOR = '#dc2626';  // Spoilage Crimson
  const OTHER_COLORS = ['#f97316', '#eab308', '#9333ea', '#0284c7']; // Citrus, Mango, Grape, Water

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.DASHBOARD);
      if (response.data.success) {
        setStats(response.data);
      } else {
        setError(response.data.error || 'Failed to load dashboard data.');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Unable to connect to Flask backend. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="dashboard-container animate-fade-in dashboard-status-view">
        <div className="status-spinner-box glass-panel">
          <Activity size={36} className="animate-spin text-fresh" />
          <p>Loading fruit quality analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="dashboard-container animate-fade-in dashboard-status-view">
        <div className="status-spinner-box glass-panel">
          <div className="text-danger error-title">{error}</div>
          <button className="btn btn-primary" onClick={fetchStats}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format data for Fresh vs Rotten Doughnut Chart
  const categoryData = Object.keys(stats?.category_distribution || {}).map(key => {
    const isFresh = key.toLowerCase().includes('fresh');
    const isRotten = key.toLowerCase().includes('rotten');
    return {
      name: key,
      value: (stats.category_distribution || {})[key],
      color: isFresh ? FRESH_COLOR : (isRotten ? ROTTEN_COLOR : OTHER_COLORS[0])
    };
  });

  // Confidence distribution data for Bar Chart
  const confidenceData = Object.keys(stats?.confidence_distribution || {}).map(key => ({
    name: key,
    value: (stats.confidence_distribution || {})[key]
  }));

  const total = stats?.total_predictions || 0;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-badge">
            <Activity size={14} /> LIVE PRODUCE ANALYTICS
          </div>
          <h2>Fruit Quality Dashboard</h2>
          <p>Real-time harvest statistics, freshness distributions, and SQLite inspection logs</p>
        </div>
        
        <div className="dashboard-actions">
          <button 
            className="btn btn-secondary dashboard-btn" 
            onClick={fetchStats}
            title="Refresh dashboard stats"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            className="btn btn-primary dashboard-btn" 
            onClick={() => navigate('/predict')}
          >
            <Sparkles size={16} /> New Inspection
          </button>
        </div>
      </div>

      {/* 4 STAT METRIC CARDS */}
      <div className="stats-grid">
        <div className="stat-card glass-panel stat-total">
          <div className="stat-icon-box icon-citrus">
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.total_predictions || 0}</span>
            <span className="stat-label">Total Specimens Evaluated</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel stat-fresh">
          <div className="stat-icon-box icon-fresh">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value stat-val-fresh">
              {stats?.fresh_count || 0}
            </span>
            <span className="stat-label">
              Fresh Produce ({stats?.fresh_percentage || 0}%)
            </span>
          </div>
        </div>
        
        <div className="stat-card glass-panel stat-rotten">
          <div className="stat-icon-box icon-rotten">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value stat-val-rotten">
              {stats?.rotten_count || 0}
            </span>
            <span className="stat-label">
              Rotten / Spoiled ({stats?.rotten_percentage || 0}%)
            </span>
          </div>
        </div>
        
        <div className="stat-card glass-panel stat-confidence">
          <div className="stat-icon-box icon-harvest">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.average_confidence || 0}%</span>
            <span className="stat-label">Average Confidence</span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      {total > 0 ? (
        <div className="charts-grid">
          {/* Quality Distribution Doughnut */}
          <div className="chart-card glass-panel">
            <div className="chart-card-header">
              <h3>Produce Quality Ratio</h3>
              <span className="chart-badge">Fresh vs Rotten</span>
            </div>
            
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={114}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(14, 25, 17, 0.95)', 
                      border: '1px solid rgba(34, 197, 94, 0.2)', 
                      borderRadius: '10px',
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-legend">
              {categoryData.map((entry) => (
                <div key={entry.name} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                  <span className="legend-label">{entry.name}:</span>
                  <strong className="legend-value">{entry.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Levels Bar Chart */}
          <div className="chart-card glass-panel">
            <div className="chart-card-header">
              <h3>Inference Certainty Tiers</h3>
              <span className="chart-badge">Confidence Buckets</span>
            </div>
            
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(150,170,150,0.6)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(150,170,150,0.6)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(34, 197, 94, 0.06)'}}
                    contentStyle={{ 
                      backgroundColor: 'rgba(14, 25, 17, 0.95)', 
                      border: '1px solid rgba(34, 197, 94, 0.2)', 
                      borderRadius: '10px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'High' ? FRESH_COLOR : 
                        entry.name === 'Moderate' ? '#f59e0b' : ROTTEN_COLOR
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: FRESH_COLOR }}></div>
                <span>High (&ge;80%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Moderate (60-79%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: ROTTEN_COLOR }}></div>
                <span>Low (&lt;60%)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-dashboard glass-panel">
          <Sparkles size={44} className="empty-sparkle-icon text-fresh" />
          <h3>No Quality Predictions Recorded Yet</h3>
          <p>
            Start classifying fruit images to generate real-time freshness statistics, quality percentages, and confidence distributions.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/predict')}>
            Classify First Fruit
          </button>
        </div>
      )}

      {/* RECENT PREDICTIONS TABLE */}
      {stats?.recent_predictions && stats.recent_predictions.length > 0 && (
        <div className="recent-section glass-panel">
          <div className="recent-header">
            <div>
              <h3>Recent Predictions</h3>
              <p className="recent-sub">Latest fruit quality assessments stored in SQLite database</p>
            </div>
            <button 
              className="btn btn-secondary recent-view-all-btn" 
              onClick={() => navigate('/history')}
            >
              View Full History <ArrowRight size={15} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Identified Fruit</th>
                  <th>Quality Verdict</th>
                  <th>Confidence</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_predictions.slice(0, 5).map((item) => {
                  const isFresh = (item.prediction || item.category || '').toLowerCase().includes('fresh');
                  const badgeColor = isFresh ? FRESH_COLOR : ROTTEN_COLOR;
                  const imgUrl = item.image_filename?.startsWith('http')
                    ? item.image_filename
                    : `${API_BASE_URL}/api/uploads/${item.image_filename}`;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="recent-img-wrapper">
                          <img 
                            src={imgUrl} 
                            alt={item.category} 
                            className="recent-img"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/44?text=Fruit'; }} 
                          />
                        </div>
                      </td>
                      <td>
                        <strong className="fruit-name-text">{item.fruit_name || 'Fruit'}</strong>
                      </td>
                      <td>
                        <span className={`quality-badge ${isFresh ? 'fresh' : 'rotten'}`}>
                          {item.prediction || item.category}
                        </span>
                      </td>
                      <td>
                        <span className="confidence-text" style={{ color: badgeColor }}>
                          {item.confidence}%
                        </span>
                      </td>
                      <td className="timestamp-text">
                        {item.created_at || item.timestamp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
