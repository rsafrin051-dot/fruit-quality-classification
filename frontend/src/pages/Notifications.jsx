import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const initialNotifications = [
  {
    id: 1, type: 'success', read: false,
    title: 'Batch Analysis Complete',
    message: '127 images processed successfully with 94.3% average confidence.',
    time: '2 minutes ago',
  },
  {
    id: 2, type: 'warning', read: false,
    title: 'Low Confidence Detection',
    message: '3 classifications flagged below the 75% confidence threshold. Review recommended.',
    time: '18 minutes ago',
  },
  {
    id: 3, type: 'info', read: false,
    title: 'Model Update Available',
    message: 'EfficientNet-B1 model is available with improved accuracy. Update in Settings.',
    time: '1 hour ago',
  },
  {
    id: 4, type: 'success', read: true,
    title: 'System Health Check Passed',
    message: 'All services are running normally. Backend API response time: 142ms.',
    time: '3 hours ago',
  },
  {
    id: 5, type: 'info', read: true,
    title: 'Weekly Report Ready',
    message: 'Your weekly waste classification report is now available in Analytics.',
    time: '1 day ago',
  },
  {
    id: 6, type: 'warning', read: true,
    title: 'Storage Usage at 80%',
    message: 'Database storage is at 80% capacity. Consider archiving old classification records.',
    time: '2 days ago',
  },
];

const typeConfig = {
  success: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  system: { icon: Zap, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(n => n.map(item => ({ ...item, read: true })));
  const deleteNotif = (id) => setNotifications(n => n.filter(item => item.id !== id));
  const toggleRead = (id) => setNotifications(n => n.map(item => item.id === id ? { ...item, read: !item.read } : item));

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-header glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'var(--primary-color)', position: 'relative' }}>
          <Bell size={40} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Notifications</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(150,150,150,0.3)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'success', label: 'Success' },
          { key: 'warning', label: 'Warnings' },
          { key: 'info', label: 'Info' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: filter === tab.key ? 'var(--primary-color)' : 'transparent',
              color: filter === tab.key ? 'white' : 'inherit',
              opacity: filter === tab.key ? 1 : 0.6,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '800px' }}>
        {filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', opacity: 0.6 }}>
            <Bell size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '1.1rem' }}>No notifications found</p>
          </div>
        ) : (
          filtered.map(notif => {
            const config = typeConfig[notif.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem', borderRadius: '1rem',
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  opacity: notif.read ? 0.7 : 1,
                  borderLeft: notif.read ? 'none' : `3px solid ${config.color}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color, flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{notif.title}</span>
                    {!notif.read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.5rem', opacity: 0.75, fontSize: '0.88rem', lineHeight: 1.5 }}>{notif.message}</p>
                  <span style={{ fontSize: '0.78rem', opacity: 0.5 }}>{notif.time}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleRead(notif.id)}
                    title={notif.read ? 'Mark as unread' : 'Mark as read'}
                    style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid rgba(150,150,150,0.2)', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}
                  >
                    <CheckCheck size={14} />
                  </button>
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    title="Delete"
                    style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
