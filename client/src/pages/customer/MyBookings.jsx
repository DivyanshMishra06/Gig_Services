import { useState, useEffect } from 'react';
import { getBookings, getBookingById, createPaymentOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { openRazorpayCheckout } from '../../services/razorpay';
import { useTranslation } from 'react-i18next';

export default function MyBookings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payingId, setPayingId] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data } = await getBookings();
      setBookings(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const refreshPaymentStatus = async (bookingId) => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 2000));
      const { data } = await getBookingById(bookingId);
      if (data.paymentStatus === 'paid') {
        setPaymentMessage(t('myBookings.paymentVerified'));
        await loadBookings();
        return;
      }
      if (data.paymentStatus === 'failed') {
        setPaymentMessage(t('myBookings.paymentNotCompleted'));
        await loadBookings();
        return;
      }
    }
    setPaymentMessage(t('myBookings.paymentBeingVerified'));
    await loadBookings();
  };

  const payForBooking = async (booking) => {
    setPayingId(booking._id);
    setPaymentMessage('');
    try {
      const { data: order } = await createPaymentOrder(booking._id);
      const checkout = await openRazorpayCheckout({ order, booking, customer: user });
      if (checkout.submitted) await refreshPaymentStatus(booking._id);
      else setPaymentMessage(t('myBookings.paymentNotCompletedReady'));
    } catch (error) {
      setPaymentMessage(error.response?.data?.message || error.message || t('myBookings.couldNotStartPayment'));
    } finally {
      setPayingId('');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const tabs = [
    { key: 'all', label: t('myBookings.all') },
    { key: 'pending', label: t('myBookings.pending') },
    { key: 'accepted', label: t('myBookings.accepted') },
    { key: 'in_progress', label: t('myBookings.inProgress') },
    { key: 'completed', label: t('myBookings.completed') },
    { key: 'cancelled', label: t('myBookings.cancelled') }
  ];

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('myBookings.title')}</h1>
        <p>{t('myBookings.subtitle')}</p>
      </div>
      {paymentMessage && <p role="status" className="profile-message profile-success">{paymentMessage}</p>}

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label} {statusCounts[tab.key] > 0 && `(${statusCounts[tab.key]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>{t('myBookings.noBookings')}</h3>
          <p>{filter !== 'all' ? t('myBookings.emptyHint', { filter: tabs.find(tab => tab.key === filter)?.label }) : t('myBookings.emptyHintAll')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(b => (
            <div className="booking-card" key={b._id}>
              <div className="booking-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="booking-id">{b.bookingId}</span>
                  {b.isEmergency && <span className="badge badge-danger">🚨 {t('myBookings.emergency')}</span>}
                </div>
                <span className={`status-badge status-${b.status}`}>{b.status?.replace(/_/g, ' ')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('myBookings.service')}</div>
                  <div style={{ fontWeight: 600 }}>{b.serviceName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('myBookings.worker')}</div>
                  <div style={{ fontWeight: 600 }}>{b.workerName || t('myBookings.assigning')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('myBookings.date')}</div>
                  <div style={{ fontWeight: 600 }}>{new Date(b.date || b.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {b.estimatedPrice && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {b.time && `${b.time} • `}
                    {b.address?.full || t('myBookings.addressOnFile')}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>
                    ₹{b.actualPrice || b.estimatedPrice}
                  </span>
                </div>
              )}

              {b.status === 'awaiting_payment' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('myBookings.awaitingPayment')}</span>
                  <button className="btn btn-primary btn-sm" disabled={payingId === b._id} onClick={() => payForBooking(b)}>{payingId === b._id ? t('myBookings.openingPayment') : t('myBookings.paySecurely')}</button>
                </div>
              )}

              {/* Timeline */}
              {b.timeline?.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>{t('myBookings.timeline')}</div>
                  <div className="timeline">
                    {b.timeline.slice(-3).map((tl, i) => (
                      <div className="timeline-item" key={i}>
                        <div className="event">{tl.note || tl.status}</div>
                        <div className="time">{new Date(tl.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
