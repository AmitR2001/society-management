import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', note: '', assignedTo: '' });

  const load = async () => {
    const { data } = await api.get('/complaints');
    setComplaints(data);
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  useEffect(() => { 
    load(); 
    if (user?.role === 'Admin') {
      loadUsers();
    }
  }, [user?.role]);

  const createComplaint = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user.flat) {
      setError('You are not assigned to a flat. Please contact admin.');
      return;
    }
    
    try {
      await api.post('/complaints', { ...form, flat: user.flat });
      setForm({ title: '', description: '' });
      setSuccess('Complaint submitted successfully');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const updateComplaint = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await api.patch(`/complaints/${selectedComplaint._id}`, updateForm);
      setSuccess('Complaint updated successfully');
      setSelectedComplaint(null);
      setUpdateForm({ status: '', note: '', assignedTo: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateForm({
      status: complaint.status,
      note: '',
      assignedTo: complaint.assignedTo?._id || ''
    });
  };

  const getStatusBadge = (status) => {
    const colors = { 
      Pending: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', 
      'In Progress': 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
      Resolved: 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
    };
    return (
      <span style={{
        ...styles.badge,
        background: colors[status] || '#6c757d'
      }}>
        {status}
      </span>
    );
  };

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📝 Complaints</h2>
        <p style={styles.subtitle}>
          {user?.role === 'Admin' ? 'Manage and resolve resident complaints' : 'Register and track your complaints'}
        </p>
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

      {/* Admin Stats */}
      {user?.role === 'Admin' && (
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}}>
            <span style={styles.statIcon}>⏳</span>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{pendingCount}</span>
              <span style={styles.statLabel}>Pending</span>
            </div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'}}>
            <span style={styles.statIcon}>🔄</span>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{inProgressCount}</span>
              <span style={styles.statLabel}>In Progress</span>
            </div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}>
            <span style={styles.statIcon}>✅</span>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{resolvedCount}</span>
              <span style={styles.statLabel}>Resolved</span>
            </div>
          </div>
        </div>
      )}

      {/* Resident: Create Complaint Form */}
      {user?.role === 'Resident' && (
        <div style={styles.formCard}>
          <h5 style={styles.formTitle}>📝 Raise a Complaint</h5>
          <form onSubmit={createComplaint}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input 
                style={styles.input} 
                placeholder="Brief title of your complaint" 
                required 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea 
                style={{...styles.input, ...styles.textarea}} 
                placeholder="Describe your issue in detail..." 
                rows="4" 
                required 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
              />
            </div>
            <button type="submit" style={styles.primaryBtn}>
              📤 Submit Complaint
            </button>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>
          📋 {user?.role === 'Admin' ? 'All Complaints' : 'Your Complaints'}
        </h4>
        
        {complaints.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p style={styles.emptyText}>No complaints found</p>
          </div>
        ) : (
          <div style={styles.complaintsList}>
            {complaints.map((c) => (
              <div key={c._id} style={styles.complaintCard}>
                <div style={styles.complaintHeader}>
                  <div style={styles.complaintTitleRow}>
                    <h5 style={styles.complaintTitle}>{c.title}</h5>
                    {getStatusBadge(c.status)}
                  </div>
                  {user?.role === 'Admin' && c.status !== 'Resolved' && (
                    <button 
                      style={styles.updateBtn}
                      onClick={() => openUpdateModal(c)}
                    >
                      ✏️ Update
                    </button>
                  )}
                </div>
                
                <p style={styles.complaintDesc}>{c.description}</p>
                
                <div style={styles.complaintMeta}>
                  {user?.role === 'Admin' && (
                    <>
                      <span style={styles.metaItem}>
                        🏠 Flat: {c.flat?.number || '-'}
                      </span>
                      <span style={styles.metaItem}>
                        👤 {c.resident?.fullName || '-'}
                      </span>
                    </>
                  )}
                  {c.assignedTo && (
                    <span style={styles.metaItem}>
                      👤 Assigned: {c.assignedTo.fullName}
                    </span>
                  )}
                  <span style={styles.metaItem}>
                    📅 {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Complaint History */}
                {c.history && c.history.length > 0 && (
                  <details style={styles.historyDetails}>
                    <summary style={styles.historySummary}>
                      📜 View History ({c.history.length})
                    </summary>
                    <div style={styles.historyList}>
                      {c.history.map((h, idx) => (
                        <div key={idx} style={styles.historyItem}>
                          {getStatusBadge(h.status)}
                          <span style={styles.historyNote}>{h.note}</span>
                          <span style={styles.historyDate}>
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Complaint Modal (Admin) */}
      {selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>Update Complaint</h5>
              <button style={styles.modalClose} onClick={() => setSelectedComplaint(null)}>×</button>
            </div>
            <form onSubmit={updateComplaint}>
              <div style={styles.modalBody}>
                <div style={styles.modalComplaintInfo}>
                  <strong>{selectedComplaint.title}</strong>
                  <p style={styles.modalComplaintDesc}>{selectedComplaint.description}</p>
                  <small style={styles.modalComplaintMeta}>
                    Flat: {selectedComplaint.flat?.number} | 
                    Resident: {selectedComplaint.resident?.fullName}
                  </small>
                </div>
                <hr style={styles.divider} />
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Status *</label>
                  <select 
                    style={styles.select} 
                    value={updateForm.status} 
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select 
                    style={styles.select} 
                    value={updateForm.assignedTo} 
                    onChange={(e) => setUpdateForm({...updateForm, assignedTo: e.target.value})}
                  >
                    <option value="">-- Not Assigned --</option>
                    {users.filter(u => u.role !== 'Resident').map((u) => (
                      <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Note / Resolution Details</label>
                  <textarea 
                    style={{...styles.input, ...styles.textarea}} 
                    rows="3"
                    placeholder="Add a note about this update..."
                    value={updateForm.note} 
                    onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.secondaryBtn} onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  Update Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    background: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '100px',
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
  secondaryBtn: {
    padding: '14px 28px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
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
  complaintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  complaintCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  complaintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  complaintTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  complaintTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    margin: 0,
  },
  updateBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  complaintDesc: {
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  complaintMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  metaItem: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  historyDetails: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  historySummary: {
    cursor: 'pointer',
    color: '#475569',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
  historyList: {
    marginTop: '12px',
    paddingLeft: '16px',
    borderLeft: '3px solid #e2e8f0',
  },
  historyItem: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '0.9rem',
  },
  historyNote: {
    color: '#475569',
    flex: 1,
  },
  historyDate: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    borderRadius: '20px 20px 0 0',
  },
  modalTitle: {
    margin: 0,
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  modalComplaintInfo: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  modalComplaintDesc: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: '8px 0',
  },
  modalComplaintMeta: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '20px 0',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
  },
};

export default ComplaintsPage;
