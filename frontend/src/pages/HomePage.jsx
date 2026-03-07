import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [societyInfo, setSocietyInfo] = useState({ name: 'Society Management System' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSocietyInfo = async () => {
      try {
        const { data } = await api.get('/societies/public');
        setSocietyInfo(data);
      } catch (error) {
        console.error('Failed to fetch society info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSocietyInfo();
  }, []);

  const loginCards = [
    {
      title: 'Resident',
      description: 'Access your dashboard, pay bills, book amenities, and manage complaints.',
      icon: '🏠',
      loginLink: '/login',
      registerLink: '/register',
      gradient: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    },
    {
      title: 'Admin',
      description: 'Manage society, residents, staff, billing, and all administrative tasks.',
      icon: '👨‍💼',
      loginLink: '/login',
      registerLink: null,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    },
    {
      title: 'Staff / Security',
      description: 'Manage visitors, handle security tasks, and access staff portal.',
      icon: '🛡️',
      loginLink: '/staff-login',
      registerLink: null,
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          {loading ? (
            <h1 style={styles.societyName}>Loading...</h1>
          ) : (
            <>
              <h1 style={styles.societyName}>{societyInfo.name}</h1>
              {societyInfo.city && societyInfo.state && (
                <p style={styles.location}>
                  📍 {societyInfo.city}, {societyInfo.state}
                </p>
              )}
            </>
          )}
          <p style={styles.tagline}>Your complete society management solution</p>
        </div>
      </div>

      {/* Login Cards Section - Only show when NOT logged in */}
      {!user ? (
        <div style={styles.cardsSection}>
          <h2 style={styles.sectionTitle}>Choose Your Portal</h2>
          <div style={styles.cardsContainer}>
            {loginCards.map((card, index) => (
              <div key={index} style={{ ...styles.card, background: card.gradient }}>
                <div style={styles.cardIcon}>{card.icon}</div>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDescription}>{card.description}</p>
                <div style={styles.cardButtons}>
                  <Link to={card.loginLink} style={styles.loginButton}>
                    Login
                  </Link>
                  {card.registerLink && (
                    <Link to={card.registerLink} style={styles.registerLink}>
                      New User? Register
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeContent}>
            <h2 style={styles.welcomeTitle}>Welcome back, {user.fullName || user.name}!</h2>
            <p style={styles.welcomeText}>Access your dashboard to manage society services</p>
            <Link to="/dashboard" style={styles.dashboardButton}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>What We Offer</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: '💳', title: 'Bill Management', desc: 'Easy bill payment & tracking' },
            { icon: '🎉', title: 'Amenity Booking', desc: 'Book community amenities' },
            { icon: '📢', title: 'Notice Board', desc: 'Stay updated with announcements' },
            { icon: '🚗', title: 'Visitor Management', desc: 'Track & manage visitors' },
            { icon: '📝', title: 'Complaints', desc: 'Register & track complaints' },
            { icon: '👥', title: 'Staff Management', desc: 'Manage society staff' },
          ].map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <span style={styles.featureIcon}>{feature.icon}</span>
              <h4 style={styles.featureTitle}>{feature.title}</h4>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab5 100%)',
    padding: '80px 20px',
    textAlign: 'center',
    color: 'white',
    marginTop: '-24px',
    marginLeft: '-12px',
    marginRight: '-12px',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  societyName: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  location: {
    fontSize: '1.2rem',
    opacity: '0.9',
    marginBottom: '15px',
  },
  tagline: {
    fontSize: '1.3rem',
    opacity: '0.85',
    fontWeight: '300',
  },
  cardsSection: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  welcomeSection: {
    backgroundImage: 'url(/bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '100px 20px',
    position: 'relative',
  },
  welcomeContent: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    padding: '50px 40px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: '15px',
  },
  welcomeText: {
    fontSize: '1.1rem',
    color: '#64748b',
    marginBottom: '30px',
  },
  dashboardButton: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    color: 'white',
    padding: '16px 50px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.1rem',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2rem',
    color: '#1e3a5f',
    marginBottom: '40px',
    fontWeight: '600',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    justifyContent: 'center',
  },
  card: {
    borderRadius: '20px',
    padding: '40px 30px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  cardIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '15px',
  },
  cardDescription: {
    fontSize: '1rem',
    opacity: '0.9',
    marginBottom: '25px',
    lineHeight: '1.6',
  },
  cardButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: 'white',
    color: '#333',
    padding: '14px 40px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  registerLink: {
    color: 'white',
    textDecoration: 'underline',
    fontSize: '0.95rem',
    opacity: '0.9',
  },
  featuresSection: {
    padding: '60px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '25px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  featureCard: {
    textAlign: 'center',
    padding: '25px 15px',
    borderRadius: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transition: 'transform 0.2s ease',
  },
  featureIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: '#666',
  },
};

export default HomePage;
