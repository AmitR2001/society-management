import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NoticesPage = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const { data } = await api.get('/notices');
    setNotices(data);
  };

  useEffect(() => { load(); }, []);

  const createNotice = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/notices', form);
      setForm({ title: '', content: '' });
      setSuccess('Notice posted successfully!');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notice');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📢 Notice Board</h2>
        <p style={styles.subtitle}>Stay updated with society announcements</p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={styles.alert}>
          {error}
          <button style={styles.alertClose} onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          {success}
          <button style={styles.alertClose} onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Admin: Create Notice Form */}
      {user.role === 'Admin' && (
        <div style={styles.formCard}>
          <h5 style={styles.formTitle}>📝 Post New Notice</h5>
          <form onSubmit={createNotice}>
            <input 
              style={styles.input} 
              placeholder="Notice Title" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              required 
            />
            <textarea 
              style={{...styles.input, ...styles.textarea}} 
              placeholder="Write your announcement here..." 
              value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })} 
              required 
              rows={4}
            />
            <button type="submit" style={styles.primaryBtn}>
              📤 Post Notice
            </button>
          </form>
        </div>
      )}

      {/* Notices List */}
      <div style={styles.noticesSection}>
        {notices.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p style={styles.emptyText}>No notices posted yet</p>
          </div>
        ) : (
          <div style={styles.noticesGrid}>
            {notices.map((n, index) => (
              <div 
                key={n._id} 
                style={{
                  ...styles.noticeCard,
                  borderLeft: `4px solid ${index % 3 === 0 ? '#475569' : index % 3 === 1 ? '#7c3aed' : '#0284c7'}`
                }}
              >
                <div style={styles.noticeHeader}>
                  <span style={styles.noticeIcon}>📌</span>
                  <h5 style={styles.noticeTitle}>{n.title}</h5>
                </div>
                <p style={styles.noticeContent}>{n.content}</p>
                <div style={styles.noticeMeta}>
                  <span style={styles.metaItem}>
                    👤 {n.postedBy?.fullName || 'Admin'}
                  </span>
                  <span style={styles.metaItem}>
                    🕐 {getTimeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
  },
  alert: {
    padding: '14px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertSuccess: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
  alertClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  formCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    marginBottom: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '120px',
  },
  primaryBtn: {
    padding: '14px 28px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  noticesSection: {},
  emptyState: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '16px',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1.1rem',
  },
  noticesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  noticeCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  },
  noticeHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  noticeIcon: {
    fontSize: '1.5rem',
  },
  noticeTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1e3a5f',
    margin: 0,
    flex: 1,
  },
  noticeContent: {
    color: '#475569',
    lineHeight: '1.7',
    marginBottom: '16px',
    fontSize: '1rem',
  },
  noticeMeta: {
    display: 'flex',
    gap: '24px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  metaItem: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
};

export default NoticesPage;
