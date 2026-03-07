import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  // Refresh user data from server (to get latest flat assignment, etc.)
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token) return;
      
      // Different endpoint for staff
      if (currentUser.type === 'staff') {
        const { data } = await api.get('/staff/me');
        const updatedUser = {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          society: data.society,
          type: 'staff'
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const { data } = await api.get('/auth/profile');
        const updatedUser = {
          id: data._id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          society: data.society,
          flat: data.flat
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      // Token might be invalid, logout
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Refresh user on mount to get latest data
  useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshUser();
    }
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  // Staff login
  const staffLogin = async (payload) => {
    const { data } = await api.post('/staff/login', payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.staff));
    setUser(data.staff);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, staffLogin, register, logout, refreshUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
