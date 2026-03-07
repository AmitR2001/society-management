<<<<<<< HEAD
import { Navigate } from 'react-router-dom';
=======
﻿import { Navigate } from 'react-router-dom';
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
