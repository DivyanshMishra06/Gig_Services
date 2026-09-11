import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getServices } from '../../services/api';

export default function CustomerDashboard() {
  const { user } = useAuth();
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
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>What do you need help with today?</p>
      </div>

      {/* Quick Services */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Quick Book</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
          {quickServices.map((s, i) => (
            <Link to={`/workers?skill=${s.name}`} key={i} style={{ textDecoration: 'none' }}>
              <div className="service-bubble" style={{ borderColor: `${s.color}22` }}>
                <div className="icon">{s.icon}</div>
                <div className="name">{s.name}</div>
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
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{activeBookings.length}</div>
          <div className="stat-label">Active Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{services.length || 12}</div>
          <div className="stat-label">Services Available</div>
        </div>
      </div>

      {/* Active Bookings */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active Bookings</h2>
          <Link to="/bookings" className="booking-view-all">
            <span>View all</span>
            <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
        {activeBookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No active bookings</h3>
            <p>Book a service to get started!</p>
            <Link to="/services" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Browse Services</Link>
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
                  Worker: {b.workerName || 'Assigning...'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(b.date || b.createdAt).toLocaleDateString()} {b.time && `• ${b.time}`}
                </p>
                {b.isEmergency && <span className="badge badge-danger" style={{ marginTop: '8px' }}>🚨 Emergency</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
