import { useEffect, useState } from 'react';
import api from '../../services/api';

const SocietyManagementPage = () => {
  const [society, setSociety] = useState(null);
  const [flats, setFlats] = useState([]);
  const [residents, setResidents] = useState([]);
  const [activeTab, setActiveTab] = useState('society');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [societyForm, setSocietyForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [flatForm, setFlatForm] = useState({
    block: '',
    floor: '',
    number: '',
    maintenanceCharge: 0
  });

  const [editingFlat, setEditingFlat] = useState(null);
  const [editFlatForm, setEditFlatForm] = useState({
    block: '',
    floor: '',
    number: '',
    maintenanceCharge: 0
  });

  const loadSociety = async () => {
    try {
      const { data } = await api.get('/societies/me');
      setSociety(data);
      setSocietyForm({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || ''
      });
    } catch (err) {
      console.error('Failed to load society');
    }
  };

  const loadFlats = async () => {
    try {
      const { data } = await api.get('/flats');
      setFlats(data);
    } catch (err) {
      console.error('Failed to load flats');
    }
  };

  const loadResidents = async () => {
    try {
      const { data } = await api.get('/flats/available-residents');
      setResidents(data);
    } catch (err) {
      console.error('Failed to load residents');
    }
  };

  useEffect(() => {
    loadSociety();
    loadFlats();
    loadResidents();
  }, []);

  const updateSociety = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.patch('/societies/me', societyForm);
      setSuccess('Society details updated successfully');
      loadSociety();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update society');
    } finally {
      setLoading(false);
    }
  };

  const createFlat = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/flats', {
        ...flatForm,
        floor: Number(flatForm.floor),
        maintenanceCharge: Number(flatForm.maintenanceCharge)
      });
      setSuccess('Flat created successfully');
      setFlatForm({ block: '', floor: '', number: '', maintenanceCharge: 0 });
      loadFlats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create flat');
    } finally {
      setLoading(false);
    }
  };

  const assignResident = async (flatId, residentId) => {
    try {
      await api.patch(`/flats/${flatId}`, { resident: residentId || null });
      setSuccess('Resident assigned successfully');
      loadFlats();
      loadResidents();
    } catch (err) {
      setError('Failed to assign resident');
    }
  };

  const openEditFlat = (flat) => {
    setEditingFlat(flat);
    setEditFlatForm({
      block: flat.block || '',
      floor: flat.floor || '',
      number: flat.number || '',
      maintenanceCharge: flat.maintenanceCharge || 0
    });
  };

  const updateFlat = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.patch(`/flats/${editingFlat._id}`, {
        block: editFlatForm.block,
        floor: Number(editFlatForm.floor),
        number: editFlatForm.number,
        maintenanceCharge: Number(editFlatForm.maintenanceCharge)
      });
      setSuccess('Flat updated successfully');
      setEditingFlat(null);
      loadFlats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update flat');
    } finally {
      setLoading(false);
    }
  };

  const deleteFlat = async (flatId) => {
    if (!window.confirm('Are you sure you want to delete this flat?')) return;
    try {
      await api.delete(`/flats/${flatId}`);
      setSuccess('Flat deleted successfully');
      loadFlats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete flat');
    }
  };

  const [bulkForm, setBulkForm] = useState({
    block: '',
    startFloor: 1,
    endFloor: 5,
    flatsPerFloor: 4,
    maintenanceCharge: 0
  });

  const createBulkFlats = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const flatsToCreate = [];
      for (let floor = bulkForm.startFloor; floor <= bulkForm.endFloor; floor++) {
        for (let flat = 1; flat <= bulkForm.flatsPerFloor; flat++) {
          flatsToCreate.push({
            block: bulkForm.block,
            floor: floor,
            number: `${floor}0${flat}`,
            maintenanceCharge: Number(bulkForm.maintenanceCharge)
          });
        }
      }

      let created = 0;
      for (const flatData of flatsToCreate) {
        try {
          await api.post('/flats', flatData);
          created++;
        } catch (err) {
          // Skip duplicates
        }
      }

      setSuccess(`Created ${created} flats successfully`);
      setBulkForm({ block: '', startFloor: 1, endFloor: 5, flatsPerFloor: 4, maintenanceCharge: 0 });
      loadFlats();
    } catch (err) {
      setError('Failed to create flats');
    } finally {
      setLoading(false);
    }
  };

  const occupiedFlats = flats.filter(f => f.resident).length;
  const vacantFlats = flats.filter(f => !f.resident).length;

  const tabs = [
    { id: 'society', label: '🏛️ Society Details' },
    { id: 'create-flats', label: '➕ Create Flats' },
    { id: 'manage-flats', label: '🏠 Manage Flats', badge: flats.length }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏗️ Society Management</h2>
        <p style={styles.subtitle}>Manage society details, flats, and resident assignments</p>
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
          <span style={styles.statIcon}>🏠</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{flats.length}</span>
            <span style={styles.statLabel}>Total Flats</span>
          </div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}>
          <span style={styles.statIcon}>✅</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{occupiedFlats}</span>
            <span style={styles.statLabel}>Occupied</span>
          </div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}}>
          <span style={styles.statIcon}>🔓</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{vacantFlats}</span>
            <span style={styles.statLabel}>Vacant</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {})}}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge > 0 && <span style={styles.tabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Society Details Tab */}
      {activeTab === 'society' && (
        <div style={styles.formCard}>
          <h5 style={styles.formTitle}>🏛️ Society Information</h5>
          <form onSubmit={updateSociety}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Society Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={societyForm.name}
                  onChange={(e) => setSocietyForm({ ...societyForm, name: e.target.value })}
                  required
                  placeholder="Enter society name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <input
                  type="text"
                  style={styles.input}
                  value={societyForm.address}
                  onChange={(e) => setSocietyForm({ ...societyForm, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  style={styles.input}
                  value={societyForm.city}
                  onChange={(e) => setSocietyForm({ ...societyForm, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  style={styles.input}
                  value={societyForm.state}
                  onChange={(e) => setSocietyForm({ ...societyForm, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pincode</label>
                <input
                  type="text"
                  style={styles.input}
                  value={societyForm.pincode}
                  onChange={(e) => setSocietyForm({ ...societyForm, pincode: e.target.value })}
                  placeholder="Pincode"
                />
              </div>
            </div>
            <button type="submit" style={styles.primaryBtn} disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Update Society'}
            </button>
          </form>
        </div>
      )}

      {/* Create Flats Tab */}
      {activeTab === 'create-flats' && (
        <div style={styles.createFlatsGrid}>
          <div style={styles.formCard}>
            <h5 style={styles.formTitle}>🏠 Create Single Flat</h5>
            <form onSubmit={createFlat}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Block *</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., A, B, C"
                  value={flatForm.block}
                  onChange={(e) => setFlatForm({ ...flatForm, block: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Floor *</label>
                <input
                  type="number"
                  style={styles.input}
                  value={flatForm.floor}
                  onChange={(e) => setFlatForm({ ...flatForm, floor: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Flat Number *</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., 101, 102"
                  value={flatForm.number}
                  onChange={(e) => setFlatForm({ ...flatForm, number: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Maintenance Charge (₹)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={flatForm.maintenanceCharge}
                  onChange={(e) => setFlatForm({ ...flatForm, maintenanceCharge: e.target.value })}
                  min="0"
                />
              </div>
              <button type="submit" style={{...styles.primaryBtn, width: '100%'}} disabled={loading}>
                {loading ? '⏳ Creating...' : '➕ Create Flat'}
              </button>
            </form>
          </div>

          <div style={styles.formCard}>
            <h5 style={styles.formTitle}>🏢 Bulk Create Flats</h5>
            <form onSubmit={createBulkFlats}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Block Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., A, B, C"
                  value={bulkForm.block}
                  onChange={(e) => setBulkForm({ ...bulkForm, block: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div style={styles.floorGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Floor *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={bulkForm.startFloor}
                    onChange={(e) => setBulkForm({ ...bulkForm, startFloor: Number(e.target.value) })}
                    required
                    min="0"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Floor *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={bulkForm.endFloor}
                    onChange={(e) => setBulkForm({ ...bulkForm, endFloor: Number(e.target.value) })}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Flats Per Floor *</label>
                <input
                  type="number"
                  style={styles.input}
                  value={bulkForm.flatsPerFloor}
                  onChange={(e) => setBulkForm({ ...bulkForm, flatsPerFloor: Number(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Maintenance Charge (₹)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={bulkForm.maintenanceCharge}
                  onChange={(e) => setBulkForm({ ...bulkForm, maintenanceCharge: e.target.value })}
                  min="0"
                />
              </div>
              <button type="submit" style={{...styles.successBtn, width: '100%'}} disabled={loading}>
                {loading ? '⏳ Creating...' : `🏢 Create ${(bulkForm.endFloor - bulkForm.startFloor + 1) * bulkForm.flatsPerFloor} Flats`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Flats Tab */}
      {activeTab === 'manage-flats' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>All Flats</span>
            <div style={styles.headerBadges}>
              <span style={styles.totalBadge}>{flats.length} Total</span>
              <span style={styles.occupiedBadge}>{occupiedFlats} Occupied</span>
              <span style={styles.vacantBadge}>{vacantFlats} Vacant</span>
            </div>
          </div>
          {flats.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🏠</span>
              <p style={styles.emptyText}>No flats created yet</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Block</th>
                    <th style={styles.th}>Flat No</th>
                    <th style={styles.th}>Floor</th>
                    <th style={{...styles.th, minWidth: '280px'}}>Assign Resident</th>
                    <th style={styles.th}>Maintenance</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flats.map((flat) => (
                    <tr key={flat._id} style={styles.tr}>
                      <td style={{...styles.td, fontWeight: '700'}}>
                        <span style={styles.blockBadge}>{flat.block}</span>
                      </td>
                      <td style={styles.td}>{flat.number}</td>
                      <td style={styles.td}>{flat.floor}</td>
                      <td style={styles.td}>
                        <select
                          style={styles.residentSelect}
                          value={flat.resident?._id || ''}
                          onChange={(e) => assignResident(flat._id, e.target.value)}
                        >
                          <option value="">-- Vacant --</option>
                          {residents.map((r) => {
                            const isCurrentResident = flat.resident?._id === r._id;
                            const isAssignedElsewhere = r.flat && r.flat._id !== flat._id;
                            return (
                              <option
                                key={r._id}
                                value={r._id}
                                disabled={isAssignedElsewhere}
                              >
                                {r.fullName} ({r.email})
                                {isCurrentResident ? ' ✓' : ''}
                                {isAssignedElsewhere ? ` [${r.flat.block}-${r.flat.number}]` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td style={styles.td}>₹{flat.maintenanceCharge?.toLocaleString() || 0}</td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button style={styles.editBtn} onClick={() => openEditFlat(flat)}>✏️</button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => deleteFlat(flat._id)}
                            disabled={flat.resident}
                            title={flat.resident ? 'Remove resident first' : 'Delete flat'}
                          >
                            🗑️
                          </button>
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

      {/* Edit Flat Modal */}
      {editingFlat && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>Edit Flat - {editingFlat.block}-{editingFlat.number}</h5>
              <button style={styles.modalClose} onClick={() => setEditingFlat(null)}>×</button>
            </div>
            <form onSubmit={updateFlat}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Block *</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={editFlatForm.block}
                    onChange={(e) => setEditFlatForm({ ...editFlatForm, block: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Floor *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={editFlatForm.floor}
                    onChange={(e) => setEditFlatForm({ ...editFlatForm, floor: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Flat Number *</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={editFlatForm.number}
                    onChange={(e) => setEditFlatForm({ ...editFlatForm, number: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Maintenance Charge (₹)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={editFlatForm.maintenanceCharge}
                    onChange={(e) => setEditFlatForm({ ...editFlatForm, maintenanceCharge: e.target.value })}
                    min="0"
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.secondaryBtn} onClick={() => setEditingFlat(null)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                  {loading ? '⏳ Updating...' : '💾 Update Flat'}
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
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  formCard: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#64748b', marginBottom: '8px' },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
  },
  primaryBtn: {
    padding: '14px 28px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '14px 28px', borderRadius: '10px', border: '2px solid #e2e8f0',
    background: 'white', color: '#64748b', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  successBtn: {
    padding: '14px 28px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
  },
  createFlatsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' },
  floorGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
    padding: '20px 24px', background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white', fontWeight: '600',
  },
  headerBadges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  totalBadge: { padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' },
  occupiedBadge: { padding: '4px 12px', borderRadius: '20px', background: '#22c55e', fontSize: '0.85rem' },
  vacantBadge: { padding: '4px 12px', borderRadius: '20px', background: '#94a3b8', fontSize: '0.85rem' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '16px 20px', background: '#f8fafc', color: '#475569', fontWeight: '600', textAlign: 'left', fontSize: '0.9rem' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '16px 20px', color: '#475569' },
  blockBadge: {
    display: 'inline-block', padding: '6px 14px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', color: 'white', fontWeight: '600',
  },
  residentSelect: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0',
    fontSize: '0.9rem', background: 'white', cursor: 'pointer',
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
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px',
    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', borderRadius: '20px 20px 0 0',
  },
  modalTitle: { margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '600' },
  modalClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
  modalBody: { padding: '24px' },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px',
    padding: '16px 24px', borderTop: '1px solid #e2e8f0',
  },
};

export default SocietyManagementPage;
