<<<<<<< HEAD
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/HomePage';
=======
﻿import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import StaffLoginPage from './pages/StaffLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import SecurityDashboard from './pages/security/SecurityDashboard';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import SocietyManagementPage from './pages/admin/SocietyManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import BillsPage from './pages/common/BillsPage';
import ComplaintsPage from './pages/common/ComplaintsPage';
import VisitorsPage from './pages/common/VisitorsPage';
import AmenitiesPage from './pages/common/AmenitiesPage';
import NoticesPage from './pages/common/NoticesPage';

const DashboardSelector = () => {
  const { user } = useAuth();
  if (user?.type === 'staff') return <Navigate to="/staff-dashboard" />;
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Security') return <SecurityDashboard />;
  return <ResidentDashboard />;
};

// Protected route for staff only
const StaffRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/staff-login" />;
  if (user.type !== 'staff') return <Navigate to="/dashboard" />;
  return children;
};

const App = () => (
<<<<<<< HEAD
  <div style={{ minHeight: '100vh' }}>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
=======
  <div>
    <Navbar />
    <main className="container py-4">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/staff-login" element={<StaffLoginPage />} />
<<<<<<< HEAD
        <Route path="/unauthorized" element={<div className="container py-4"><h4>Unauthorized</h4></div>} />
=======
        <Route path="/unauthorized" element={<h4>Unauthorized</h4>} />
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a

        {/* Staff routes */}
        <Route path="/staff-dashboard" element={<StaffRoute><StaffDashboardPage /></StaffRoute>} />
        <Route path="/staff-visitors" element={<StaffRoute><VisitorsPage /></StaffRoute>} />

        {/* Regular user routes */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['Admin', 'Resident', 'Security']}><DashboardSelector /></ProtectedRoute>} />
        <Route path="/society" element={<ProtectedRoute roles={['Admin']}><SocietyManagementPage /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute roles={['Admin']}><StaffManagementPage /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute roles={['Admin', 'Resident']}><BillsPage /></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute roles={['Admin', 'Resident', 'Security']}><ComplaintsPage /></ProtectedRoute>} />
        <Route path="/visitors" element={<ProtectedRoute roles={['Admin', 'Resident', 'Security']}><VisitorsPage /></ProtectedRoute>} />
        <Route path="/amenities" element={<ProtectedRoute roles={['Admin', 'Resident']}><AmenitiesPage /></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute roles={['Admin', 'Resident', 'Security']}><NoticesPage /></ProtectedRoute>} />
      </Routes>
    </main>
  </div>
);

export default App;
