import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AmenitiesPage = () => {
  const { user } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [amenityForm, setAmenityForm] = useState({ name: '', description: '', feePerSlot: 0 });
  const [bookForm, setBookForm] = useState({ amenity: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [aRes, bRes] = await Promise.all([api.get('/amenities/amenities'), api.get('/amenities/bookings')]);
    setAmenities(aRes.data);
    setBookings(bRes.data);
  };

  useEffect(() => { load(); }, []);

  const createAmenity = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/amenities/amenities', amenityForm);
      setAmenityForm({ name: '', description: '', feePerSlot: 0 });
      setSuccess('Amenity created successfully!');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create amenity');
    }
  };

  const createBooking = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user.flat) {
      setError('You are not assigned to a flat. Please contact admin.');
      return;
    }
    
    try {
      await api.post('/amenities/bookings', { ...bookForm, flat: user.flat });
      setBookForm({ amenity: '', startTime: '', endTime: '' });
      setSuccess('Booking confirmed!');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book amenity');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🎉 Amenities & Bookings</h2>
          <p style={styles.subtitle}>Book community facilities and manage reservations</p>
        </div>
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

      {/* Admin: Add Amenity Form */}
      {user.role === 'Admin' && (
        <div style={styles.formCard}>
          <h5 style={styles.formTitle}>➕ Add New Amenity</h5>
          <form onSubmit={createAmenity} style={styles.form}>
            <div style={styles.formGrid}>
              <input 
                style={styles.input} 
                placeholder="Amenity Name" 
                value={amenityForm.name} 
                onChange={(e) => setAmenityForm({ ...amenityForm, name: e.target.value })} 
                required 
              />
              <input 
                style={styles.input} 
                placeholder="Description" 
                value={amenityForm.description} 
                onChange={(e) => setAmenityForm({ ...amenityForm, description: e.target.value })} 
              />
              <input 
                style={styles.input} 
                type="number" 
                placeholder="Fee per slot (₹)" 
                value={amenityForm.feePerSlot} 
                onChange={(e) => setAmenityForm({ ...amenityForm, feePerSlot: Number(e.target.value) })} 
              />
              <button type="submit" style={styles.primaryBtn}>Create Amenity</button>
            </div>
          </form>
        </div>
      )}

      {/* Book Slot Form */}
      <div style={styles.formCard}>
        <h5 style={styles.formTitle}>📅 Book a Slot</h5>
        <form onSubmit={createBooking} style={styles.form}>
          <div style={styles.formGrid}>
            <select 
              style={styles.select} 
              value={bookForm.amenity} 
              onChange={(e) => setBookForm({ ...bookForm, amenity: e.target.value })} 
              required
            >
              <option value="">Select Amenity</option>
              {amenities.map((a) => <option key={a._id} value={a._id}>{a.name} - ₹{a.feePerSlot}/slot</option>)}
            </select>
            <div style={styles.dateGroup}>
              <label style={styles.dateLabel}>Start Time</label>
              <input 
                style={styles.input} 
                type="datetime-local" 
                value={bookForm.startTime} 
                onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })} 
                required 
              />
            </div>
            <div style={styles.dateGroup}>
              <label style={styles.dateLabel}>End Time</label>
              <input 
                style={styles.input} 
                type="datetime-local" 
                value={bookForm.endTime} 
                onChange={(e) => setBookForm({ ...bookForm, endTime: e.target.value })} 
                required 
              />
            </div>
            <button type="submit" style={styles.successBtn}>Book Now</button>
          </div>
        </form>
      </div>

      {/* Available Amenities */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>🏊 Available Amenities</h4>
        <div style={styles.amenitiesGrid}>
          {amenities.length === 0 ? (
            <p style={styles.emptyText}>No amenities available yet.</p>
          ) : amenities.map((a) => (
            <div key={a._id} style={styles.amenityCard}>
              <div style={styles.amenityIcon}>
                {a.name.toLowerCase().includes('pool') ? '🏊' : 
                 a.name.toLowerCase().includes('gym') ? '🏋️' :
                 a.name.toLowerCase().includes('hall') ? '🎪' :
                 a.name.toLowerCase().includes('court') ? '🎾' : '🎯'}
              </div>
              <h6 style={styles.amenityName}>{a.name}</h6>
              <p style={styles.amenityDesc}>{a.description || 'No description'}</p>
              <span style={styles.amenityPrice}>₹{a.feePerSlot}/slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>📋 {user.role === 'Admin' ? 'All Bookings' : 'Your Bookings'}</h4>
        {bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p style={styles.emptyText}>No bookings yet</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Amenity</th>
                  {user.role === 'Admin' && <th style={styles.th}>Resident</th>}
                  {user.role === 'Admin' && <th style={styles.th}>Flat</th>}
                  <th style={styles.th}>Start Time</th>
                  <th style={styles.th}>End Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={styles.tr}>
                    <td style={styles.td}>{b.amenity?.name || '-'}</td>
                    {user.role === 'Admin' && <td style={styles.td}>{b.resident?.fullName || '-'}</td>}
                    {user.role === 'Admin' && <td style={styles.td}>{b.flat?.number || '-'}</td>}
                    <td style={styles.td}>{new Date(b.startTime).toLocaleString()}</td>
                    <td style={styles.td}>{new Date(b.endTime).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: b.status === 'Booked' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#6c757d'
                      }}>
                        {b.status}
                      </span>
                    </td>
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
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '16px',
  },
  form: {},
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    alignItems: 'end',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '0.95rem',
    background: 'white',
    cursor: 'pointer',
  },
  dateGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dateLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500',
  },
  primaryBtn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  successBtn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '20px',
  },
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
  amenityCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  },
  amenityIcon: {
    fontSize: '3rem',
    marginBottom: '12px',
  },
  amenityName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  amenityDesc: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '12px',
  },
  amenityPrice: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '12px',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1rem',
  },
  tableWrapper: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#1e3a5f',
    borderBottom: '2px solid #e2e8f0',
    background: 'rgba(248, 250, 252, 0.9)',
  },
  tr: {
    transition: 'background 0.2s',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
};

export default AmenitiesPage;
