import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Image as ImageIcon, Trash2, 
  RefreshCw, Sparkles, Clock, Layers, ShieldCheck, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../services/api';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const LIMIT = 10;

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.PREDICTIONS}?page=${page}&limit=${LIMIT}`);
      if (response.data.success) {
        setHistory(response.data.data || []);
        setTotal(response.data.total || 0);
        setHasMore(response.data.has_more ?? false);
      }
    } catch (err) {
      console.error('Failed to fetch fruit prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete prediction record #${id}?`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_ENDPOINTS.PREDICTIONS}/${id}`);
      fetchHistory();
    } catch (err) {
      alert(`Could not delete record #${id}: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getQualityBadge = (category) => {
    const isFresh = (category || '').toLowerCase().includes('fresh');
    return (
      <span className={`history-quality-badge ${isFresh ? 'fresh' : 'rotten'}`}>
        {category}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="history-container animate-fade-in">
      <div className="history-header">
        <div className="history-title-group">
          <div className="history-badge">
            <Database size={14} /> PRODUCE AUDIT LEDGER
          </div>
          <h2>Prediction History</h2>
          <p>Comprehensive historical database of all evaluated fruit specimens stored in SQLite</p>
        </div>

        <div className="history-actions">
          <button 
            className="btn btn-secondary history-btn" 
            onClick={fetchHistory}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            className="btn btn-primary history-btn" 
            onClick={() => navigate('/predict')}
          >
            <Sparkles size={16} /> New Inspection
          </button>
        </div>
      </div>

      <div className="history-card glass-panel">
        {loading && history.length === 0 ? (
          <div className="history-loading-state">
            <RefreshCw size={32} className="animate-spin text-fresh" />
            <p>Loading fruit prediction records from SQLite...</p>
          </div>
        ) : total === 0 ? (
          <div className="empty-history-state">
            <div className="empty-icon-wrapper">
              <ImageIcon size={42} />
            </div>
            <h3>No Fruit Predictions Found</h3>
            <p>
              Upload and classify a fruit image to generate your first quality assessment record.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/predict')}>
              Classify a Fruit Now
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Sample Photo</th>
                    <th>Fruit Name</th>
                    <th>Quality Verdict</th>
                    <th>Confidence Score</th>
                    <th>Architecture</th>
                    <th>Inspection Date</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const isFresh = (item.prediction || item.category || '').toLowerCase().includes('fresh');
                    const confColor = isFresh ? 'var(--fruit-fresh)' : 'var(--fruit-rotten)';
                    const imageUrl = item.image_filename?.startsWith('http')
                      ? item.image_filename
                      : `${API_BASE_URL}/api/uploads/${item.image_filename}`;

                    return (
                      <tr key={item.id || item._id} className="history-row">
                        <td>
                          <div className="history-img-wrapper">
                            <img 
                              src={imageUrl} 
                              alt={item.category} 
                              className="history-img"
                              onError={(e) => { 
                                e.target.src = 'https://via.placeholder.com/48?text=Fruit'; 
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <strong className="fruit-label">{item.fruit_name || 'Fruit'}</strong>
                        </td>
                        <td>
                          {getQualityBadge(item.prediction || item.category)}
                        </td>
                        <td>
                          <div className="history-confidence-wrapper">
                            <span className="conf-value" style={{ color: confColor }}>
                              {item.confidence}%
                            </span>
                            <div className="conf-track">
                              <div 
                                className="conf-track-fill" 
                                style={{ 
                                  width: `${Math.min(100, item.confidence)}%`,
                                  backgroundColor: confColor
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="history-model-tag">
                            {item.model_name || 'MobileNetV2'}
                          </span>
                        </td>
                        <td className="history-date">
                          {formatDate(item.created_at || item.timestamp)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            title="Delete this record from SQLite"
                            className="delete-action-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="history-pagination">
              <button 
                className="btn btn-secondary pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span className="pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> &bull; Total <strong>{total}</strong> Records
              </span>

              <button 
                className="btn btn-secondary pagination-btn"
                disabled={page >= totalPages || !hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
