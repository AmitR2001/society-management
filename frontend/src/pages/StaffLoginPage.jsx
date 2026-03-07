import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffLoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { staffLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await staffLogin(form);
      navigate('/staff-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-3">Staff Login</h3>
          <p className="text-muted mb-3">For society staff members (Security, Housekeeping, etc.)</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input 
                className="form-control" 
                type="email" 
                placeholder="Enter your email" 
                required 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                className="form-control" 
                type="password" 
                placeholder="Enter your password" 
                required 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
              />
            </div>
            <button className="btn btn-success w-100" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Staff Login'}
            </button>
          </form>
          <hr />
          <p className="mb-0 text-center">
            <Link to="/login">Resident/Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
