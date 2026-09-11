import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getServices } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [services, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        getBookings().catch(() => ({ data: [] })),
        getServices().catch(() => ({ data: [] }))
      ]);
      setBookings(bRes.data || []);
      setServicesData(sRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const quickServices = [
    { icon: '🔧', name: 'Plumbing', color: '#0B8F4D' },
    { icon: '⚡', name: 'Electrical', color: '#F5823A' },
    { icon: '❄️', name: 'AC Repair', color: '#3B82F6' },
    { icon: '🧹', name: 'Cleaning', color: '#10B981' },
    { icon: '🪚', name: 'Carpentry', color: '#D4692E' },
    { icon: '🎨', name: 'Painting', color: '#8B5CF6' },
    { icon: '🔌', name: 'Appliance', color: '#3B82F6' },
    { icon: '💇', name: 'Beauty', color: '#EC4899' }
  ];

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('customerDashboard.welcome', { name: user?.name?.split(' ')[0] || '' })} 👋</h1>
        <p>{t('customerDashboard.subtitle')}</p>
      </div>

      {/* Quick Services */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>{t('customerDashboard.quickBook')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
          {quickServices.map((s, i) => (
            <Link to={`/workers?skill=${s.name}`} key={i} style={{ textDecoration: 'none' }}>
              <div className="service-bubble" style={{ borderColor: `${s.color}22` }}>
                <div className="icon">{s.icon}</div>
                <div className="name">{t(`landing.serviceNames.${s.name === 'AC Repair' ? 'acRepair' : s.name.toLowerCase()}`)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">{t('customerDashboard.totalBookings')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{activeBookings.length}</div>
          <div className="stat-label">{t('customerDashboard.activeBookings')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">{t('customerDashboard.completed')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{services.length || 12}</div>
          <div className="stat-label">{t('customerDashboard.servicesAvailable')}</div>
        </div>
      </div>

      {/* Active Bookings */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('customerDashboard.activeBookings')}</h2>
          <Link to="/bookings" className="btn btn-ghost btn-sm">{t('customerDashboard.viewAll')}</Link>
        </div>
        {activeBookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>{t('customerDashboard.noActiveBookings')}</h3>
            <p>{t('customerDashboard.bookServicePrompt')}</p>
            <Link to="/services" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>{t('customerDashboard.browseServices')}</Link>
          </div>
        ) : (
          <div className="grid-2">
            {activeBookings.slice(0, 4).map(b => (
              <div className="booking-card" key={b._id}>
                <div className="booking-card-header">
                  <span className="booking-id">{b.bookingId}</span>
                  <span className={`status-badge status-${b.status}`}>{b.status?.replace('_', ' ')}</span>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>{b.serviceName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  {t('customerDashboard.worker')} {b.workerName || t('customerDashboard.assigning')}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(b.date || b.createdAt).toLocaleDateString()} {b.time && `• ${b.time}`}
                </p>
                {b.isEmergency && <span className="badge badge-danger" style={{ marginTop: '8px' }}>🚨 {t('customerDashboard.emergency')}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
