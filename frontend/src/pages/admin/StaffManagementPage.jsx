import { useEffect, useState } from 'react';
import api from '../../services/api';

const StaffManagementPage = () => {
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);

  const [staffForm, setStaffForm] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    password: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [attendanceForm, setAttendanceForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });

  const loadStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      setStaff(data);
    } catch (err) {
      setError('Failed to load staff');
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const resetForm = () => {
    setStaffForm({
      name: '',
      role: '',
      phone: '',
      email: '',
      password: '',
      salary: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setEditingStaff(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = {
        ...staffForm,
        salary: Number(staffForm.salary)
      };
      if (editingStaff && !data.password) {
        delete data.password;
      }

      if (editingStaff) {
        await api.patch(`/staff/${editingStaff._id}`, data);
        setSuccess('Staff updated successfully');
      } else {
        await api.post('/staff', data);
        setSuccess('Staff added successfully');
      }
      resetForm();
      loadStaff();
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const editStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name,
      role: staffMember.role,
      phone: staffMember.phone,
      email: staffMember.email || '',
      password: '',
      salary: staffMember.salary,
      joinDate: staffMember.joinDate?.split('T')[0] || ''
    });
    setActiveTab('add');
  };

  const deleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      setSuccess('Staff deleted successfully');
      loadStaff();
    } catch (err) {
      setError('Failed to delete staff');
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.patch(`/staff/${attendanceForm.staffId}/attendance`, {
        date: attendanceForm.date,
        status: attendanceForm.status
      });
      setSuccess('Attendance marked successfully');
      loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const markBulkAttendance = async (status) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      for (const s of staff) {
        await api.patch(`/staff/${s._id}/attendance`, {
          date: today,
          status: status
        });
      }
      setSuccess(`Marked all staff as ${status} for today`);
      loadStaff();
    } catch (err) {
      setError('Failed to mark bulk attendance');
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyAttendance = (staffMember) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const present = (staffMember.attendance || []).filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && a.status === 'Present';
    }).length;

    const absent = (staffMember.attendance || []).filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && a.status === 'Absent';
    }).length;

    return { present, absent };
  };

  const calculateSalary = (staffMember) => {
    const { present, absent } = getMonthlyAttendance(staffMember);
    const totalDays = present + absent;
    if (totalDays === 0) return staffMember.salary;
    const perDay = staffMember.salary / 30;
    return Math.round(present * perDay);
  };

  const staffRoles = ['Security', 'Housekeeping', 'Gardener', 'Electrician', 'Plumber', 'Watchman', 'Manager', 'Accountant', 'Other'];

  const tabs = [
    { id: 'list', label: '👥 Staff List', badge: staff.length },
    { id: 'add', label: editingStaff ? '✏️ Edit Staff' : '➕ Add Staff' },
    { id: 'attendance', label: '📋 Attendance' },
    { id: 'salary', label: '💰 Salary Details' }
  ];

  const totalSalary = staff.reduce((sum, s) => sum + calculateSalary(s), 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👷 Staff Management</h2>
        <p style={styles.subtitle}>Manage staff, attendance, and salary details</p>
      </div>

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

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #475569 0%, #334155 100%)'}}>
          <span style={styles.statIcon}>👥</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{staff.length}</span>
            <span style={styles.statLabel}>Total Staff</span>
          </div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}>
          <span style={styles.statIcon}>💰</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>₹{totalSalary.toLocaleString()}</span>
            <span style={styles.statLabel}>Monthly Payroll</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {})}}
            onClick={() => { setActiveTab(tab.id); if (tab.id !== 'add') resetForm(); }}
          >
            {tab.label}
            {tab.badge > 0 && <span style={styles.tabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Staff List Tab */}
      {activeTab === 'list' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>All Staff Members</span>
            <button style={styles.addBtn} onClick={() => setActiveTab('add')}>+ Add Staff</button>
          </div>
          {staff.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>👤</span>
              <p style={styles.emptyText}>No staff members added yet</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Login</th>
                    <th style={styles.th}>Salary</th>
                    <th style={styles.th}>Join Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id} style={styles.tr}>
                      <td style={{...styles.td, fontWeight: '600'}}>{s.name}</td>
                      <td style={styles.td}><span style={styles.roleBadge}>{s.role}</span></td>
                      <td style={styles.td}>{s.phone}</td>
                      <td style={styles.td}>{s.email || '-'}</td>
                      <td style={styles.td}>
                        {s.email ? (
                          <span style={styles.enabledBadge}>Enabled</span>
                        ) : (
                          <span style={styles.disabledBadge}>No</span>
                        )}
                      </td>
                      <td style={styles.td}>₹{s.salary?.toLocaleString()}</td>
                      <td style={styles.td}>{s.joinDate ? new Date(s.joinDate).toLocaleDateString() : '-'}</td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button style={styles.editBtn} onClick={() => editStaff(s)}>✏️</button>
                          <button style={styles.deleteBtn} onClick={() => deleteStaff(s._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Staff Tab */}
      {activeTab === 'add' && (
        <div style={styles.formCard}>
          <h5 style={styles.formTitle}>{editingStaff ? '✏️ Edit Staff Member' : '➕ Add New Staff'}</h5>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  style={styles.select}
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  {staffRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  style={styles.input}
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  required
                  placeholder="Phone number"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email (for login)</label>
                <input
                  type="email"
                  style={styles.input}
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>{editingStaff ? 'New Password' : 'Password'}</label>
                <input
                  type="password"
                  style={styles.input}
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder={editingStaff ? 'Leave blank to keep' : 'Set password'}
                  required={!editingStaff && !!staffForm.email}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Monthly Salary (₹) *</label>
                <input
                  type="number"
                  style={styles.input}
                  value={staffForm.salary}
                  onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })}
                  required
                  min="0"
                  placeholder="Monthly salary"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Join Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={staffForm.joinDate}
                  onChange={(e) => setStaffForm({ ...staffForm, joinDate: e.target.value })}
                />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? '⏳ Saving...' : editingStaff ? '💾 Update Staff' : '➕ Add Staff'}
              </button>
              {editingStaff && (
                <button type="button" style={styles.secondaryBtn} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div style={styles.attendanceGrid}>
          <div style={styles.formCard}>
            <h5 style={styles.formTitle}>📋 Mark Attendance</h5>
            <form onSubmit={markAttendance}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Staff Member *</label>
                <select
                  style={styles.select}
                  value={attendanceForm.staffId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, staffId: e.target.value })}
                  required
                >
                  <option value="">Select Staff</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <button type="submit" style={{...styles.primaryBtn, width: '100%'}} disabled={loading}>
                📝 Mark Attendance
              </button>
            </form>

            <hr style={styles.divider} />
            <p style={styles.quickActionLabel}>Quick Actions for Today:</p>
            <div style={styles.quickActions}>
              <button style={styles.presentBtn} onClick={() => markBulkAttendance('Present')} disabled={loading}>
                ✅ Mark All Present
              </button>
              <button style={styles.absentBtn} onClick={() => markBulkAttendance('Absent')} disabled={loading}>
                ❌ Mark All Absent
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <h5 style={styles.cardTitle}>📊 This Month's Attendance</h5>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Present</th>
                    <th style={styles.th}>Absent</th>
                    <th style={styles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => {
                    const { present, absent } = getMonthlyAttendance(s);
                    return (
                      <tr key={s._id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight: '600'}}>{s.name}</td>
                        <td style={styles.td}><span style={styles.roleBadge}>{s.role}</span></td>
                        <td style={{...styles.td, color: '#22c55e', fontWeight: '600'}}>{present}</td>
                        <td style={{...styles.td, color: '#ef4444', fontWeight: '600'}}>{absent}</td>
                        <td style={styles.td}>{present + absent}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Salary Tab */}
      {activeTab === 'salary' && (
        <div style={styles.card}>
          <h5 style={styles.cardTitle}>
            💰 Salary Details - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h5>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Staff Name</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Base Salary</th>
                  <th style={styles.th}>Present</th>
                  <th style={styles.th}>Absent</th>
                  <th style={styles.th}>Calculated</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const { present, absent } = getMonthlyAttendance(s);
                  const calculated = calculateSalary(s);
                  return (
                    <tr key={s._id} style={styles.tr}>
                      <td style={{...styles.td, fontWeight: '600'}}>{s.name}</td>
                      <td style={styles.td}><span style={styles.roleBadge}>{s.role}</span></td>
                      <td style={styles.td}>₹{s.salary?.toLocaleString()}</td>
                      <td style={{...styles.td, color: '#22c55e', fontWeight: '600'}}>{present}</td>
                      <td style={{...styles.td, color: '#ef4444', fontWeight: '600'}}>{absent}</td>
                      <td style={{...styles.td, fontWeight: '700', color: '#1e3a5f'}}>₹{calculated.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={styles.totalRow}>
                  <td style={styles.totalTd} colSpan="5"><strong>Total Payable</strong></td>
                  <td style={{...styles.totalTd, fontSize: '1.2rem'}}>
                    <strong>₹{totalSalary.toLocaleString()}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '24px' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '1rem' },
  alert: {
    padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  alertSuccess: { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  alertClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px', marginBottom: '24px',
  },
  statCard: {
    borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center',
    gap: '16px', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  statIcon: { fontSize: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1.8rem', fontWeight: '700' },
  statLabel: { fontSize: '0.9rem', opacity: 0.9 },
  tabsContainer: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0' },
  tab: {
    padding: '14px 24px', borderRadius: '12px 12px 0 0', border: 'none',
    background: 'rgba(255,255,255,0.7)', color: '#64748b', fontWeight: '500',
    fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: { background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', color: 'white' },
  tabBadge: { marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' },
  card: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '600',
  },
  cardTitle: { padding: '20px 24px', fontWeight: '600', color: '#1e3a5f', borderBottom: '1px solid #e2e8f0', margin: 0 },
  addBtn: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: '500', cursor: 'pointer',
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '16px 20px', background: '#f8fafc', color: '#475569', fontWeight: '600', textAlign: 'left', fontSize: '0.9rem' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '16px 20px', color: '#475569' },
  roleBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', fontSize: '0.85rem', fontWeight: '500',
  },
  enabledBadge: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', fontSize: '0.8rem',
  },
  disabledBadge: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
    background: '#94a3b8', color: 'white', fontSize: '0.8rem',
  },
  actionBtns: { display: 'flex', gap: '8px' },
  editBtn: {
    padding: '6px 12px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', cursor: 'pointer', fontSize: '0.9rem',
  },
  deleteBtn: {
    padding: '6px 12px', borderRadius: '8px', border: '2px solid #ef4444',
    background: 'white', cursor: 'pointer', fontSize: '0.9rem',
  },
  emptyState: { textAlign: 'center', padding: '60px 40px' },
  emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },
  emptyText: { color: '#64748b', fontSize: '1.1rem' },
  formCard: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#64748b', marginBottom: '8px' },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '1rem', background: 'white', cursor: 'pointer', boxSizing: 'border-box',
  },
  formActions: { display: 'flex', gap: '12px', marginTop: '24px' },
  primaryBtn: {
    padding: '14px 28px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '14px 28px', borderRadius: '10px', border: '2px solid #e2e8f0',
    background: 'white', color: '#64748b', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  attendanceGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' },
  divider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' },
  quickActionLabel: { color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' },
  quickActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  presentBtn: {
    padding: '12px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white', fontWeight: '600', cursor: 'pointer',
  },
  absentBtn: {
    padding: '12px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: 'white', fontWeight: '600', cursor: 'pointer',
  },
  totalRow: { background: 'linear-gradient(135deg, #475569 0%, #334155 100%)' },
  totalTd: { padding: '16px 20px', color: 'white', fontWeight: '600' },
};

export default StaffManagementPage;
