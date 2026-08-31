import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Hide navbar on landing if not logged in
  const isLanding = location.pathname === '/' && !user;

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'customer') {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/services', label: 'Services' },
        { path: '/workers', label: 'Find Workers' },
        { path: '/bookings', label: 'My Bookings' }
      ];
    }
    if (user.role === 'worker') {
      return [
        { path: '/worker', label: 'Dashboard' },
        { path: '/worker/earnings', label: 'Earnings' },
        { path: '/worker/welfare', label: 'Welfare' }
      ];
    }
    if (user.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/workers', label: 'Workers' },
        { path: '/admin/forecast', label: 'Forecast' }
      ];
    }
    return [];
  };

  if (isLanding) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            🤝 <span>Coop<span className="highlight">Gig</span></span>
          </Link>
          <div className="navbar-links">
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/dashboard') : '/'} className="navbar-brand">
          🤝 <span>Coop<span className="highlight">Gig</span></span>
        </Link>
        <div className="navbar-links">
          {getNavLinks().map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {user && (
          <div className="user-menu">
            <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
