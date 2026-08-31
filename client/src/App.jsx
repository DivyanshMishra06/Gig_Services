import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import ServiceBrowse from './pages/customer/ServiceBrowse';
import WorkerSearch from './pages/customer/WorkerSearch';
import BookingPage from './pages/customer/BookingPage';
import MyBookings from './pages/customer/MyBookings';
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerEarnings from './pages/worker/Earnings';
import WorkerWelfare from './pages/worker/Welfare';
import AdminDashboard from './pages/admin/Dashboard';
import AdminWorkers from './pages/admin/Workers';
import AdminForecast from './pages/admin/Forecast';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  const getDefaultDashboard = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'worker') return '/worker';
    return '/dashboard';
  };

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={getDefaultDashboard()} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={getDefaultDashboard()} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultDashboard()} /> : <Register />} />

      {/* Customer routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute roles={['customer']}><ServiceBrowse /></ProtectedRoute>} />
      <Route path="/workers" element={<ProtectedRoute roles={['customer']}><WorkerSearch /></ProtectedRoute>} />
      <Route path="/book/:workerId" element={<ProtectedRoute roles={['customer']}><BookingPage /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>} />

      {/* Worker routes */}
      <Route path="/worker" element={<ProtectedRoute roles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
      <Route path="/worker/earnings" element={<ProtectedRoute roles={['worker']}><WorkerEarnings /></ProtectedRoute>} />
      <Route path="/worker/welfare" element={<ProtectedRoute roles={['worker']}><WorkerWelfare /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/workers" element={<ProtectedRoute roles={['admin']}><AdminWorkers /></ProtectedRoute>} />
      <Route path="/admin/forecast" element={<ProtectedRoute roles={['admin']}><AdminForecast /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
