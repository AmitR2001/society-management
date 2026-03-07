import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const token = searchParams.get('token');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // Prevent double execution in React StrictMode
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      if (!token) {
        setStatus('Verification token is missing.');
        return;
      }

      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        setStatus(data.message || 'Email verified successfully.');
        setIsSuccess(true);
      } catch (err) {
        setStatus(err.response?.data?.message || 'Verification failed');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-3">Email Verification</h3>
          <p className={isSuccess ? 'text-success' : ''}>{status}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
