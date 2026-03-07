<<<<<<< HEAD
import { useState } from 'react';
=======
﻿import { useState } from 'react';
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Resident'
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [verifyLink, setVerifyLink] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(form);
      setMsg(data.message || 'Registration successful.');
      setError('');
      
      // If verifyUrl is provided (email failed), show it
      if (data.verifyUrl) {
        setVerifyLink(data.verifyUrl);
      } else {
        // Redirect to login after 3 seconds if email was sent
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-3">Register</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}
          {verifyLink && (
            <div className="alert alert-info">
              <strong>Click to verify your email:</strong><br />
              <a href={verifyLink} target="_blank" rel="noopener noreferrer">{verifyLink}</a>
            </div>
          )}
          <form onSubmit={onSubmit}>
            <input className="form-control mb-2" placeholder="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className="form-control mb-2" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control mb-2" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="form-control mb-2" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="form-select mb-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option>Resident</option>
              <option>Admin</option>
              <option>Security</option>
            </select>
            <button className="btn btn-primary w-100" type="submit">Create Account</button>
          </form>
          <p className="mt-3 mb-0">Already registered? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
