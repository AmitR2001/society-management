import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.type === 'staff';

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <Link style={styles.brand} to="/">
        <span style={styles.brandIcon}>🏛️</span>
        <span style={styles.brandText}>Society Manager</span>
      </Link>
      
      <div style={styles.navLinks}>
        {/* Staff Navigation */}
        {user && isStaff && (
          <Link style={styles.navLink} to="/staff-dashboard">Dashboard</Link>
        )}
        
        {/* Regular User Navigation - Only Dashboard and Society */}
        {user && !isStaff && (
          <Link style={styles.navLink} to="/dashboard">Dashboard</Link>
        )}
        {user?.role === 'Admin' && !isStaff && (
          <Link style={styles.navLink} to="/society">Society Management</Link>
        )}
      </div>

      <div style={styles.userSection}>
        {user && (
          <>
            <div style={styles.userInfo}>
              <span style={styles.userIcon}>👤</span>
              <div style={styles.userDetails}>
                <span style={styles.userName}>{isStaff ? user.name : user.fullName}</span>
                <span style={styles.userRole}>{isStaff ? `Staff - ${user.role}` : user.role}</span>
              </div>
            </div>
            <button style={styles.logoutBtn} onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'white',
  },
  brandIcon: {
    fontSize: '1.8rem',
  },
  brandText: {
    fontSize: '1.4rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transition: 'all 0.2s ease',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'white',
  },
  userIcon: {
    fontSize: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '8px',
    borderRadius: '50%',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  userRole: {
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
};

export default Navbar;
