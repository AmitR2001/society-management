import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VisitorsPage = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [form, setForm] = useState({ flat: '', name: '', phone: '', purpose: '', vehicleNo: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isStaff = user?.type === 'staff';
  const canManageVisitors = isStaff || user?.role === 'Security' || user?.role === 'Admin';
  const isResident = user?.role === 'Resident';

  const load = async () => {
    try {
      const endpoint = isStaff ? '/visitors/staff' : '/visitors';
      const { data } = await api.get(endpoint);
      setVisitors(data);
    } catch (err) {
      console.error('Failed to load visitors');
    }
  };

  const loadFlats = async () => {
    try {
      const endpoint = isStaff ? '/flats/staff' : '/flats';
      const { data } = await api.get(endpoint);
      setFlats(data);
    } catch (err) {
      console.error('Failed to load flats');
    }
  };

  useEffect(() => { 
    load(); 
    if (canManageVisitors) {
      loadFlats();
    }
  }, [user]);

  const addVisitor = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.flat) {
      setError('Please select a flat');
      return;
    }
    
    try {
      const endpoint = isStaff ? '/visitors/staff' : '/visitors';
      await api.post(endpoint, form);
      setForm({ flat: '', name: '', phone: '', purpose: '', vehicleNo: '' });
      setSuccess('Visitor logged successfully!');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log visitor');
    }
  };

  const exitVisitor = async (id) => {
    try {
      const endpoint = isStaff ? `/visitors/staff/${id}/exit` : `/visitors/${id}/exit`;
      await api.patch(endpoint);
      setSuccess('Exit marked successfully!');
      load();
    } catch (err) {
      setError('Failed to mark exit');
    }
  };

  const activeVisitors = visitors.filter(v => !v.exitTime).length;
  const exitedToday = visitors.filter(v => v.exitTime && new Date(v.exitTime).toDateString() === new Date().toDateString()).length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🚗 Visitor Management</h2>
          <p style={styles.subtitle}>
            {isResident ? 'View visitors to your apartment' : 'Track and manage visitor entries'}
          </p>
        </div>
      </div>

      {/* Stats for non-residents */}
      {!isResident && (
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #475569 0%, #334155 100%)'}}>
            <span style={styles.statIcon}>📋</span>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{visitors.length}</span>
              <span style={styles.statLabel}>Total Today</span>
            </div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}>
            <span style={styles.statIcon}>🟢</span>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{activeVisitors}</span>
              <span style={styles.statLabel}>Currently Inside</span>
            </div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'}}>
            <span style={styles.statIcon}>✅</span>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{exitedToday}</span>
              <span style={styles.statLabel}>Exited Today</span>
            </div>
          </div>
        </div>
      )}

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

      {/* Resident Info Banner */}
      {isResident && (
        <div style={styles.infoBanner}>
          <span style={styles.infoIcon}>ℹ️</span>
          <span>Showing visitors to your apartment only</span>
        </div>
      )}

      {/* Log Visitor Form */}
      {canManageVisitors && (
        <div style={styles.formCard}>
          <h5 style={styles.formTitle}>✍️ Log New Visitor</h5>
          <form onSubmit={addVisitor}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Flat *</label>
                <select 
                  style={styles.select} 
                  value={form.flat} 
                  onChange={(e) => setForm({ ...form, flat: e.target.value })} 
                  required
                >
                  <option value="">Choose flat...</option>
                  {flats.map((f) => (
                    <option key={f._id} value={f._id}>{f.block}-{f.number}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Visitor Name *</label>
                <input 
                  style={styles.input} 
                  placeholder="Enter name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input 
                  style={styles.input} 
                  placeholder="Enter phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Purpose *</label>
                <input 
                  style={styles.input} 
                  placeholder="Purpose of visit" 
                  value={form.purpose} 
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle No.</label>
                <input 
                  style={styles.input} 
                  placeholder="Optional" 
                  value={form.vehicleNo} 
                  onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })} 
                />
              </div>
              <div style={{...styles.formGroup, display: 'flex', alignItems: 'flex-end'}}>
                <button type="submit" style={styles.primaryBtn}>
                  ✅ Log Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Visitors List */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>📋 Visitor Log</h4>
        {visitors.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p style={styles.emptyText}>No visitors recorded{isResident ? ' for your apartment' : ''}</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Visitor</th>
                  {!isResident && <th style={styles.th}>Flat</th>}
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Entry Time</th>
                  <th style={styles.th}>Exit Time</th>
                  {canManageVisitors && <th style={styles.th}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.visitorInfo}>
                        <span style={styles.visitorIcon}>👤</span>
                        <div>
                          <div style={styles.visitorName}>{v.name}</div>
                          <div style={styles.visitorPhone}>{v.phone}</div>
                        </div>
                      </div>
                    </td>
                    {!isResident && (
                      <td style={styles.td}>
                        <span style={styles.flatBadge}>
                          {v.flat?.block ? `${v.flat.block}-` : ''}{v.flat?.number || '-'}
                        </span>
                      </td>
                    )}
                    <td style={styles.td}>{v.purpose}</td>
                    <td style={styles.td}>
                      <div style={styles.timeCell}>
                        <span style={styles.timeIcon}>🕐</span>
                        {new Date(v.entryTime).toLocaleString()}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {v.exitTime ? (
                        <div style={styles.timeCell}>
                          <span style={styles.timeIcon}>🕐</span>
                          {new Date(v.exitTime).toLocaleString()}
                        </div>
                      ) : (
                        <span style={styles.insideBadge}>Still Inside</span>
                      )}
                    </td>
                    {canManageVisitors && (
                      <td style={styles.td}>
                        {!v.exitTime ? (
                          <button 
                            style={styles.exitBtn} 
                            onClick={() => exitVisitor(v._id)}
                          >
                            ✅ Mark Exit
                          </button>
                        ) : (
                          <span style={styles.exitedBadge}>Exited</span>
                        )}
                      </td>
                    )}
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

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    color: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '2rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '12px',
    borderRadius: '12px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
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
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    borderRadius: '12px',
    color: 'white',
    marginBottom: '24px',
  },
  infoIcon: {
    fontSize: '1.2rem',
  },
  formCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#64748b',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '0.95rem',
    background: 'white',
    cursor: 'pointer',
  },
  primaryBtn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  section: {},
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '20px',
  },
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
  tableWrapper: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    overflow: 'hidden',
    overflowX: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#1e3a5f',
    borderBottom: '2px solid #e2e8f0',
    background: 'rgba(248, 250, 252, 0.9)',
    whiteSpace: 'nowrap',
  },
  tr: {},
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
  },
  visitorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  visitorIcon: {
    fontSize: '1.5rem',
    backgroundColor: '#f1f5f9',
    padding: '8px',
    borderRadius: '50%',
  },
  visitorName: {
    fontWeight: '600',
    color: '#1e3a5f',
  },
  visitorPhone: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  flatBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '8px',
    background: '#e2e8f0',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  timeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  timeIcon: {
    fontSize: '0.7rem',
  },
  insideBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  exitBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  exitedBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    background: '#e2e8f0',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
};

export default VisitorsPage;
