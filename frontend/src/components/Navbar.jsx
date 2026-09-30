import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Moon, X, Sparkles, Clock, BarChart2, Info, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

// Search index: Fruit Quality routes
const SEARCH_INDEX = [
  { label: 'Home Overview', description: 'Project overview & quick start', path: '/', icon: LayoutDashboard, keywords: ['home', 'overview', 'main', 'start'] },
  { label: 'Fruit Prediction', description: 'Upload fruit image to classify Fresh vs Rotten', path: '/predict', icon: Sparkles, keywords: ['predict', 'scan', 'image', 'upload', 'classify', 'fresh', 'rotten', 'fruit', 'apple', 'banana', 'orange'] },
  { label: 'Quality Dashboard', description: 'Freshness analytics, distribution charts & metrics', path: '/dashboard', icon: BarChart2, keywords: ['analytics', 'charts', 'pie', 'statistics', 'metrics', 'dashboard', 'freshness', 'rotten percentage'] },
  { label: 'Prediction History', description: 'Past fruit quality prediction records', path: '/history', icon: Clock, keywords: ['history', 'past', 'records', 'log', 'previous', 'scans'] },
  { label: 'About Project', description: 'Reema Safrin H – College ML Project details', path: '/about', icon: Info, keywords: ['about', 'version', 'college', 'reema', 'mobilenetv2', 'deep learning'] },
];

function searchIndex(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return SEARCH_INDEX.filter(item =>
    item.label.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.keywords.some(k => k.includes(q))
  ).slice(0, 6);
}

const Navbar = ({ theme, toggleTheme, toggleSidebar }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const found = searchIndex(query);
    setResults(found);
    setActiveIdx(0);
    setOpen(found.length > 0 && query.length > 0);
  }, [query]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[activeIdx]) goTo(results[activeIdx].path);
    }
  };

  const goTo = (path) => {
    navigate(path);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Search */}
        <div className="search-wrapper">
          <div className={`search-bar ${open ? 'active' : ''}`}>
            <Search size={17} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search fruit quality AI..."
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setOpen(results.length > 0)}
              onBlur={() => setTimeout(() => setOpen(false), 180)}
              autoComplete="off"
            />
            {query ? (
              <button
                className="search-clear-btn"
                onMouseDown={e => { e.preventDefault(); setQuery(''); setOpen(false); }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <div className="search-shortcut">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
              </div>
            )}
          </div>

          {open && results.length > 0 && (
            <div className="search-dropdown animate-slide-up">
              <div className="search-dropdown-label">Pages & Functions</div>
              {results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    className={`search-result-item ${i === activeIdx ? 'active' : ''}`}
                    onMouseDown={() => goTo(item.path)}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <div className="search-result-icon">
                      <Icon size={16} />
                    </div>
                    <div className="search-result-text">
                      <span className="search-result-label">{item.label}</span>
                      <span className="search-result-desc">{item.description}</span>
                    </div>
                    <div className="search-result-arrow">→</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-badge-group">
          <span className="navbar-author-badge">
            🎓 Reema Safrin H
          </span>
          <span className="project-badge">
            <span className="model-pulse-dot"></span>
            MobileNetV2
          </span>
        </div>

        <button 
          className="nav-icon-btn theme-toggle" 
          onClick={toggleTheme} 
          aria-label="Toggle visual theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
