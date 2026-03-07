import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-3">Login</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary w-100" type="submit">Sign In</button>
          </form>
          <p className="mt-3 mb-0">No account? <Link to="/register">Register</Link></p>
          <hr />
          <p className="mb-0 text-center">
            <Link to="/staff-login" className="text-success">Staff Login (Security, Housekeeping, etc.)</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
