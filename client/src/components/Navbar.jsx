import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import activeSetuMark from '../assets/activesetu-navbar-white.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const languageSelector = (
    <select
      className="language-select"
      value={i18n.language}
      onChange={(event) => i18n.changeLanguage(event.target.value)}
      aria-label="Select language"
    >
      <option value="en">🌐 English</option>
      <option value="hi">🌐 हिंदी</option>
    </select>
  );

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
        { path: '/dashboard', label: t('nav.dashboard') },
        { path: '/services', label: t('nav.services') },
        { path: '/workers', label: t('nav.findWorkers') },
        { path: '/bookings', label: t('nav.bookings') },
        { path: '/chat', label: 'Chat' }
      ];
    }
    if (user.role === 'worker') {
      return [
        { path: '/worker', label: t('nav.dashboard') },
        { path: '/worker/earnings', label: t('nav.earnings') },
        { path: '/worker/welfare', label: t('nav.welfare') }
      ];
    }
    if (user.role === 'admin') {
      return [
        { path: '/admin', label: t('nav.dashboard') },
        { path: '/admin/workers', label: t('nav.workers') },
        { path: '/admin/forecast', label: t('nav.forecast') }
      ];
    }
    return [];
  };

  if (isLanding) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <img src={activeSetuMark} alt="ActiveSetu" className="brand-mark" />
            <span className="brand-name">Active<span>Setu</span></span>
          </Link>
          <div className="navbar-links">
            {languageSelector}
            <Link to="/login" className="btn btn-ghost">{t('nav.login')}</Link>
            <Link to="/register" className="btn btn-primary btn-sm">{t('nav.getStarted')}</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/dashboard') : '/'} className="navbar-brand">
          <img src={activeSetuMark} alt="ActiveSetu" className="brand-mark" />
          <span className="brand-name">Active<span>Setu</span></span>
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
        {languageSelector}
        {user && (
          <div className="user-menu">
            <Link to="/profile" className="user-avatar" aria-label="View your profile" title="View profile">
              {user.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                user.name?.charAt(0)?.toUpperCase()
              )}
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>{t('nav.logout')}</button>
          </div>
        )}
      </div>
    </nav>
  );
}
