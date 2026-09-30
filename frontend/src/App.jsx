import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classify from './pages/Classify';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import About from './pages/About';

function App() {
  const [theme, setTheme] = useState('light');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('fruit-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fruit-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          className={isMobileSidebarOpen ? 'mobile-open' : ''}
        />

        <div className={`main-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <Navbar
            theme={theme}
            toggleTheme={toggleTheme}
            toggleSidebar={toggleSidebar}
          />

          <main className="main-content">
            <Routes>
              {/* Core Academic Navigation Structure */}
              <Route path="/" element={<Home />} />
              <Route path="/predict" element={<Classify />} />
              <Route path="/classify" element={<Classify />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/about" element={<About />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {isMobileSidebarOpen && window.innerWidth <= 1024 && (
          <div
            className="mobile-overlay"
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 95
            }}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
