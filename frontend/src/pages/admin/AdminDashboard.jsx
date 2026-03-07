import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import SimpleChart from '../../components/SimpleChart';
import api from '../../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const [usersRes, billsRes] = await Promise.all([api.get('/users'), api.get('/bills')]);
      setUsers(usersRes.data);
      setBills(billsRes.data);
    };
    run();
  }, []);

  const paid = bills.filter((b) => b.status === 'Paid' || b.status === 'PaidCash').length;
  const pending = bills.filter((b) => b.status !== 'Paid' && b.status !== 'PaidCash').length;

  const featureCards = [
    { icon: '💳', title: 'Bill Management', desc: 'Easy bill payment & tracking', path: '/bills', gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)' },
    { icon: '🎉', title: 'Amenity Booking', desc: 'Book community amenities', path: '/amenities', gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
    { icon: '📢', title: 'Notice Board', desc: 'Stay updated with announcements', path: '/notices', gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
    { icon: '🚗', title: 'Visitor Management', desc: 'Track & manage visitors', path: '/visitors', gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
    { icon: '📝', title: 'Complaints', desc: 'Register & track complaints', path: '/complaints', gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
    { icon: '👥', title: 'Staff Management', desc: 'Manage society staff', path: '/staff', gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Dashboard</h2>
        <p style={styles.subtitle}>Welcome back! Here's your society overview</p>
      </div>

      {/* Stats Section */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{users.length}</span>
            <span style={styles.statLabel}>Total Users</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{paid}</span>
            <span style={styles.statLabel}>Paid Bills</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{pending}</span>
            <span style={styles.statLabel}>Pending Bills</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={styles.chartSection}>
        <div style={styles.chartCard}>
          <h5 style={styles.chartTitle}>Collection Overview</h5>
          <SimpleChart data={[{ name: 'Paid', value: paid }, { name: 'Pending', value: pending }]} />
        </div>
      </div>

      {/* Feature Cards Section */}
      <div style={styles.featuresSection}>
        <h3 style={styles.sectionTitle}>Quick Access</h3>
        <div style={styles.featuresGrid}>
          {featureCards.map((card, index) => (
            <div
              key={index}
              style={{ ...styles.featureCard, background: card.gradient }}
              onClick={() => navigate(card.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
            >
              <span style={styles.featureIcon}>{card.icon}</span>
              <h4 style={styles.featureTitle}>{card.title}</h4>
              <p style={styles.featureDesc}>{card.desc}</p>
              <span style={styles.featureArrow}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '2.5rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '15px',
    borderRadius: '12px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  chartSection: {
    marginBottom: '30px',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '20px',
  },
  featuresSection: {
    marginTop: '20px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '20px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    borderRadius: '16px',
    padding: '28px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  featureIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '0.95rem',
    opacity: 0.9,
    marginBottom: '0',
  },
  featureArrow: {
    position: 'absolute',
    right: '24px',
    bottom: '24px',
    fontSize: '1.5rem',
    opacity: 0.7,
  },
};

export default AdminDashboard;
