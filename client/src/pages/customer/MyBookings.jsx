import { useState, useEffect } from 'react';
import { getBookings, getBookingById, createPaymentOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { openRazorpayCheckout } from '../../services/razorpay';

export default function MyBookings() {
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
        setPaymentMessage('Payment verified. Your booking is now confirmed.');
        await loadBookings();
        return;
      }
      if (data.paymentStatus === 'failed') {
        setPaymentMessage('Payment was not completed. You can try again.');
        await loadBookings();
        return;
      }
    }
    setPaymentMessage('Payment is being verified. Refresh this page shortly for the latest status.');
    await loadBookings();
  };

  const payForBooking = async (booking) => {
    setPayingId(booking._id);
    setPaymentMessage('');
    try {
      const { data: order } = await createPaymentOrder(booking._id);
      const checkout = await openRazorpayCheckout({ order, booking, customer: user });
      if (checkout.submitted) await refreshPaymentStatus(booking._id);
      else setPaymentMessage('Payment was not completed. You can try again when ready.');
    } catch (error) {
      setPaymentMessage(error.response?.data?.message || error.message || 'Could not start payment.');
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

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Track and manage your service bookings</p>
      </div>
      {paymentMessage && <p role="status" className="profile-message profile-success">{paymentMessage}</p>}

      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(t => (
          <button
            key={t.key}
            className={`tab ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label} {statusCounts[t.key] > 0 && `(${statusCounts[t.key]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No bookings found</h3>
          <p>Your {filter !== 'all' ? filter : ''} bookings will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(b => (
            <div className="booking-card" key={b._id}>
              <div className="booking-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="booking-id">{b.bookingId}</span>
                  {b.isEmergency && <span className="badge badge-danger">🚨 Emergency</span>}
                </div>
                <span className={`status-badge status-${b.status}`}>{b.status?.replace(/_/g, ' ')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Service</div>
                  <div style={{ fontWeight: 600 }}>{b.serviceName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Worker</div>
                  <div style={{ fontWeight: 600 }}>{b.workerName || 'Assigning...'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</div>
                  <div style={{ fontWeight: 600 }}>{new Date(b.date || b.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {b.estimatedPrice && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {b.time && `${b.time} • `}
                    {b.address?.full || 'Address on file'}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>
                    ₹{b.actualPrice || b.estimatedPrice}
                  </span>
                </div>
              )}

              {b.status === 'awaiting_payment' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Awaiting secure payment verification</span>
                  <button className="btn btn-primary btn-sm" disabled={payingId === b._id} onClick={() => payForBooking(b)}>{payingId === b._id ? 'Opening payment...' : 'Pay securely'}</button>
                </div>
              )}

              {/* Timeline */}
              {b.timeline?.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>Timeline</div>
                  <div className="timeline">
                    {b.timeline.slice(-3).map((t, i) => (
                      <div className="timeline-item" key={i}>
                        <div className="event">{t.note || t.status}</div>
                        <div className="time">{new Date(t.timestamp).toLocaleString()}</div>
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
