import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookings, updateBookingStatus, updateAvailability } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState('available');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await getBookings();
      setBookings(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, { status: newStatus });
      loadData();
    } catch (e) { alert(t('workerDashboard.failedUpdate')); }
  };

  const toggleAvailability = async (val) => {
    setAvailability(val);
    try { await updateAvailability({ availability: val }); } catch (e) { console.error(e); }
  };

  const availabilityLabels = { available: t('workerDashboard.available'), busy: t('workerDashboard.busy'), offline: t('workerDashboard.offline') };

  const pending = bookings.filter(b => b.status === 'pending');
  const active = bookings.filter(b => ['accepted', 'on_the_way', 'in_progress'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed');
  const todayBookings = bookings.filter(b => {
    const d = new Date(b.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{t('workerDashboard.title')}</h1>
          <p>{t('workerDashboard.welcome', { name: user?.name })}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('workerDashboard.status')}</span>
          {['available', 'busy', 'offline'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${availability === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleAvailability(s)}
            >
              <span className={`status-dot ${s}`} /> {availabilityLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{todayBookings.length}</div>
          <div className="stat-label">{t('workerDashboard.todaysJobs')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{active.length}</div>
          <div className="stat-label">{t('workerDashboard.activeJobs')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">{t('workerDashboard.pendingRequests')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completed.length}</div>
          <div className="stat-label">{t('workerDashboard.completed')}</div>
        </div>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
            🔔 {t('workerDashboard.newRequests', { count: pending.length })}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pending.map(b => (
              <div className="booking-card" key={b._id} style={{ borderLeft: b.isEmergency ? '3px solid var(--danger)' : '3px solid var(--warning)' }}>
                <div className="booking-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="booking-id">{b.bookingId}</span>
                    {b.isEmergency && <span className="badge badge-danger">🚨 {t('workerDashboard.emergency')}</span>}
                  </div>
                  <span className="status-badge status-pending">{t('workerDashboard.pendingStatus')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('workerDashboard.serviceLabel')}</span> <strong>{b.serviceName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('workerDashboard.customerLabel')}</span> <strong>{b.customerName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('workerDashboard.dateLabel')}</span> <strong>{new Date(b.date || b.createdAt).toLocaleDateString()}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('workerDashboard.priceLabel')}</span> <strong style={{ color: 'var(--accent)' }}>₹{b.estimatedPrice}</strong></div>
                </div>
                {b.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>{b.description}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(b._id, 'accepted')}>✓ {t('workerDashboard.accept')}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(b._id, 'cancelled')}>✗ {t('workerDashboard.decline')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>{t('workerDashboard.activeJobs')}</h2>
        {active.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🛠️</div>
            <h3>{t('workerDashboard.noActiveJobs')}</h3>
            <p>{t('workerDashboard.acceptToStart')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {active.map(b => (
              <div className="booking-card" key={b._id} style={{ borderLeft: '3px solid var(--primary)' }}>
                <div className="booking-card-header">
                  <div>
                    <span className="booking-id">{b.bookingId}</span>
                    <span style={{ marginLeft: '8px', fontWeight: 600 }}>{b.serviceName}</span>
                  </div>
                  <span className={`status-badge status-${b.status}`}>{b.status?.replace(/_/g, ' ')}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  {t('workerDashboard.customerLabel')} {b.customerName} • ₹{b.estimatedPrice}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {b.status === 'accepted' && <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(b._id, 'on_the_way')}>🚗 {t('workerDashboard.onTheWay')}</button>}
                  {b.status === 'on_the_way' && <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(b._id, 'in_progress')}>🔧 {t('workerDashboard.startWork')}</button>}
                  {b.status === 'in_progress' && <button className="btn btn-accent btn-sm" onClick={() => handleStatusChange(b._id, 'completed')}>✅ {t('workerDashboard.complete')}</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
