import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import activeSetuMark from '../assets/ActiveSetuNG.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('activesetu_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('activesetu_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');

  const themeToggle = (className = '') => {
    const isDark = theme === 'dark';
    return (
      <button
        type="button"
        className={`theme-toggle ${className}`}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>
    );
  };

  const languageSelector = (className = '') => (
    <select
      className={`language-select ${className}`}
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
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileOpen(false);

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

  const mobileMenu = (
    <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
      {getNavLinks().map((link) => (
        <Link key={link.path} to={link.path} className={location.pathname === link.path ? 'active' : ''} onClick={closeMobileMenu}>{link.label}</Link>
      ))}
      {languageSelector('mobile-language-select')}
      {themeToggle('mobile-theme-toggle')}
      {user ? <><Link to="/profile" onClick={closeMobileMenu}>My Profile</Link><button type="button" onClick={handleLogout}>{t('nav.logout')}</button></> : <><Link to="/login" onClick={closeMobileMenu}>{t('nav.login')}</Link><Link to="/register" onClick={closeMobileMenu}>{t('nav.getStarted')}</Link></>}
    </div>
  );

  if (isLanding) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <img src={activeSetuMark} alt="ActiveSetu" className="brand-mark" />
            <span className="brand-name">Active<span>Setu</span></span>
          </Link>
          <div className="navbar-links navbar-links-desktop">
            {languageSelector('desktop-language-select')}
            {themeToggle()}
            <Link to="/login" className="btn btn-ghost">{t('nav.login')}</Link>
            <Link to="/register" className="btn btn-primary btn-sm">{t('nav.getStarted')}</Link>
          </div>
          <button className="mobile-menu-toggle" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? '✕' : '☰'}</button>
        </div>
        {mobileMenu}
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
        <div className="navbar-links navbar-links-desktop">
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
        <div className="navbar-preferences">
          {languageSelector('desktop-language-select')}
          {themeToggle()}
        </div>
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
        <button className="mobile-menu-toggle" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? '✕' : '☰'}</button>
      </div>
      {mobileMenu}
    </nav>
  );
}
