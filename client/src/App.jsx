import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import activeSetuLogo from './assets/activesetu-logo.svg';
import { useTranslation } from 'react-i18next';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const ServiceBrowse = lazy(() => import('./pages/customer/ServiceBrowse'));
const WorkerSearch = lazy(() => import('./pages/customer/WorkerSearch'));
const BookingPage = lazy(() => import('./pages/customer/BookingPage'));
const ProviderProfile = lazy(() => import('./pages/customer/ProviderProfile'));
const Chat = lazy(() => import('./pages/customer/Chat'));
const MyBookings = lazy(() => import('./pages/customer/MyBookings'));
const HelpSupport = lazy(() => import('./pages/customer/HelpSupport'));
const WorkerDashboard = lazy(() => import('./pages/worker/Dashboard'));
const WorkerEarnings = lazy(() => import('./pages/worker/Earnings'));
const WorkerWelfare = lazy(() => import('./pages/worker/Welfare'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminWorkers = lazy(() => import('./pages/admin/Workers'));
const AdminForecast = lazy(() => import('./pages/admin/Forecast'));
const Profile = lazy(() => import('./pages/Profile'));
const WorkerInfo = lazy(() => import('./pages/WorkerInfo'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

function AppLoader() {
  return <div className="app-loader" role="status" aria-label="Loading ActiveSetu"><img src={activeSetuLogo} alt="ActiveSetu — Connecting People. Empowering Work." /></div>;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function HomeRoute() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const focusSearch = searchParams.get('focusSearch') === 'true';

  // If user just logged in from the search flow, show Landing with search focused
  if (user && focusSearch) return <Landing />;
  // Normal: logged-in users go to dashboard, guests see Landing
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'worker') return <Navigate to="/worker" />;
    return <Navigate to="/dashboard" />;
  }
  return <Landing />;
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
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={user ? <Navigate to={getDefaultDashboard()} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultDashboard()} /> : <Register />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/for-workers/:topic" element={<WorkerInfo />} />
      <Route path="/about" element={<ComingSoon />} />
      <Route path="/mission" element={<ComingSoon />} />
      <Route path="/blog" element={<ComingSoon />} />
      <Route path="/contact" element={<ComingSoon />} />

      {/* Customer routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/services" element={<ServiceBrowse />} />
      <Route path="/workers" element={<WorkerSearch />} />
      <Route path="/workers/:workerId" element={<ProviderProfile />} />
      <Route path="/book/:workerId" element={<ProtectedRoute roles={['customer']}><BookingPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute roles={['customer']}><Chat /></ProtectedRoute>} />
      <Route path="/chat/:providerId" element={<ProtectedRoute roles={['customer']}><Chat /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>} />
      <Route path="/help-support" element={<ProtectedRoute roles={['customer']}><HelpSupport /></ProtectedRoute>} />

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
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  if (isBooting) return <AppLoader />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<AppLoader />}>
          <AppRoutes />
        </Suspense>
        <AIAssistant />
      </BrowserRouter>
    </AuthProvider>
  );
}
