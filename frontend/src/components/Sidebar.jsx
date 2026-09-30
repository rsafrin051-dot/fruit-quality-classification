import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles, Scan, LayoutDashboard, History, 
  Info, BarChart2
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isCollapsed }) => {
  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon-wrapper" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' }}>
          <Sparkles className="logo-icon" size={24} color="#ffffff" />
        </div>
        {!isCollapsed && (
          <div className="logo-text-group">
            <h1 className="logo-text">FruitQuality<span className="logo-highlight">AI</span></h1>
            <span className="student-tag">
              Reema Safrin H
            </span>
          </div>
        )}
      </div>
      
      <div className="sidebar-content">
        <div className="nav-group">
          {!isCollapsed && <span className="nav-group-label">FRUIT INSPECTION</span>}
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end title="Home Overview">
              <div className="nav-icon"><LayoutDashboard size={19} /></div>
              {!isCollapsed && <span>Home</span>}
            </NavLink>
            
            <NavLink to="/predict" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Fruit Quality Lab">
              <div className="nav-icon"><Scan size={19} /></div>
              {!isCollapsed && <span>Prediction Lab</span>}
            </NavLink>
            
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Freshness Analytics">
              <div className="nav-icon"><BarChart2 size={19} /></div>
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            
            <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Inspection Audit Records">
              <div className="nav-icon"><History size={19} /></div>
              {!isCollapsed && <span>Audit History</span>}
            </NavLink>

            <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="College Project Details">
              <div className="nav-icon"><Info size={19} /></div>
              {!isCollapsed && <span>Project Details</span>}
            </NavLink>
          </nav>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="system-status" title="Deep Learning Model: MobileNetV2 Transfer Learning">
          <div className="status-indicator online"></div>
          {!isCollapsed && <span>MobileNetV2 Active</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
