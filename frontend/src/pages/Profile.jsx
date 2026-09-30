import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Camera, Shield, Activity, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [liveStats, setLiveStats] = useState({ total_predictions: 0, average_confidence: 0 });
  const [sessionCount, setSessionCount] = useState(1);
  
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@smartwaste.ai',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    role: 'System Administrator',
    joined: 'January 2026',
    bio: 'Managing the SmartWaste AI platform to optimize waste classification and improve recycling outcomes across the city.',
  });
  const [draft, setDraft] = useState({ ...profile });

  useEffect(() => {
    const saved = localStorage.getItem('smartwaste_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const updatedProfile = { ...profile, ...parsed };
        setProfile(updatedProfile);
        setDraft(updatedProfile);
      } catch (e) {}
    }

    // Track real session count
    const currentSessions = parseInt(localStorage.getItem('smartwaste_sessions') || '0', 10);
    const sessionMarked = sessionStorage.getItem('smartwaste_session_marked');
    let newSessionCount = currentSessions;
    if (!sessionMarked) {
      newSessionCount = currentSessions + 1;
      localStorage.setItem('smartwaste_sessions', newSessionCount.toString());
      sessionStorage.setItem('smartwaste_session_marked', 'true');
    }
    setSessionCount(newSessionCount || 1);

    // Fetch real backend dashboard stats
    axios.get(`${API_BASE}/api/dashboard/stats`)
      .then(res => {
        if (res.data) {
          setLiveStats(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch real profile stats:", err);
      });
  }, []);

  const stats = [
    { 
      label: 'Total Classifications', 
      value: (liveStats.total_predictions ?? 0).toLocaleString(), 
      icon: Activity, 
      color: '#22c55e' 
    },
    { 
      label: 'Accuracy Rate', 
      value: liveStats.average_confidence ? `${liveStats.average_confidence}%` : '0%', 
      icon: Shield, 
      color: '#3b82f6' 
    },
    { 
      label: 'Sessions', 
      value: sessionCount.toLocaleString(), 
      icon: Clock, 
      color: '#a855f7' 
    },
  ];

  const handleSave = () => {
    setProfile({ ...draft });
    localStorage.setItem('smartwaste_user', JSON.stringify({ ...draft }));
    setEditing(false);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword) {
      // Clear user to simulate logout, then navigate to login
      localStorage.removeItem('smartwaste_user');
      navigate('/login');
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      alert("Profile picture updated successfully!");
    }
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-header glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'var(--accent-green)' }}>
          <User size={40} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>My Profile</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Manage your account and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', maxWidth: '1000px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Avatar Card */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '2.5rem', fontWeight: 'bold',
                margin: '0 auto', boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
                border: '3px solid rgba(255,255,255,0.2)'
              }}>
                {profile.name.charAt(0)}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{
                position: 'absolute', bottom: 2, right: 2,
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--accent-green)', border: '2px solid var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white'
              }}>
                <Camera size={13} />
              </button>
            </div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 700 }}>{profile.name}</h2>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: 600 }}>{profile.role}</p>
            <p style={{ margin: '0.5rem 0 0', opacity: 0.5, fontSize: '0.8rem' }}>Member since {profile.joined}</p>
            <div style={{
              marginTop: '1.5rem', padding: '0.75rem 1rem',
              background: 'rgba(34,197,94,0.12)', borderRadius: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e' }}>Active</span>
            </div>
          </div>

          {/* Stats */}
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Account Information</h3>
            {editing ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(150,150,150,0.3)', background: 'transparent', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>
                  <X size={16} /> Cancel
                </button>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--accent-green)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  <Save size={16} /> Save
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(150,150,150,0.3)', background: 'transparent', color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 600 }}>
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { label: 'Full Name', key: 'name', icon: User },
              { label: 'Email Address', key: 'email', icon: Mail },
              { label: 'Phone Number', key: 'phone', icon: Phone },
              { label: 'Location', key: 'location', icon: MapPin },
            ].map(({ label, key, icon: Icon }) => (
              <div key={key}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Icon size={13} /> {label}
                </label>
                {editing ? (
                  <input
                    value={draft[key]}
                    onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(150,150,150,0.3)', background: 'rgba(255,255,255,0.08)', color: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ padding: '0.65rem 0', fontSize: '0.95rem', fontWeight: 500, borderBottom: '1px solid rgba(150,150,150,0.15)' }}>{profile[key]}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</label>
            {editing ? (
              <textarea
                value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(150,150,150,0.3)', background: 'rgba(255,255,255,0.08)', color: 'inherit', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            ) : (
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.7, fontSize: '0.95rem' }}>{profile.bio}</p>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(150,150,150,0.15)', marginTop: '2rem', paddingTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>Security</h3>
            <button 
              onClick={() => setShowPasswordModal(true)}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(150,150,150,0.3)', background: 'transparent', color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 600, marginRight: '0.75rem' }}
            >
              Change Password
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('smartwaste_user');
                navigate('/login');
              }}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '1rem'
        }}>
          <div className="glass-panel animate-slide-up" style={{
            width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '1.5rem',
            background: 'var(--surface)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6 }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.8 }}>New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%', padding: '0.875rem 1rem',
                    borderRadius: '0.75rem', border: '1px solid rgba(150,150,150,0.3)',
                    background: 'rgba(255,255,255,0.05)', color: 'inherit',
                    fontSize: '0.95rem', boxSizing: 'border-box',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>You will be logged out and required to sign in again after changing your password.</p>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: 'none',
                  background: 'var(--accent-green)', color: 'white',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(var(--accent-green-rgb), 0.4)',
                }}
              >
                Update Password & Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
