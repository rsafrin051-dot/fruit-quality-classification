import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Leaf } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('smartwaste_user', JSON.stringify({
        name: email.split('@')[0],
        email: email,
        role: 'User',
        joined: 'Just now'
      }));
      sessionStorage.setItem('smartwaste_session', 'active');
      if (onLoginSuccess) onLoginSuccess();
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '3rem',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto', color: 'white',
            boxShadow: '0 8px 24px rgba(34,197,94,0.4)'
          }}>
            <Leaf size={32} />
          </div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Sign in to continue to SmartWaste AI</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.8 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartwaste.ai"
                style={{
                  width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '0.75rem', border: '1px solid rgba(150,150,150,0.3)',
                  background: 'rgba(255,255,255,0.05)', color: 'inherit',
                  fontSize: '0.95rem', boxSizing: 'border-box',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>Password</label>
              <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '0.75rem', border: '1px solid rgba(150,150,150,0.3)',
                  background: 'rgba(255,255,255,0.05)', color: 'inherit',
                  fontSize: '0.95rem', boxSizing: 'border-box',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '1rem', padding: '1rem',
              borderRadius: '0.75rem', border: 'none',
              background: 'var(--accent-green)', color: 'white',
              fontSize: '1rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 8px 24px rgba(var(--accent-green-rgb), 0.4)',
              transition: 'transform 0.2s, opacity 0.2s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
