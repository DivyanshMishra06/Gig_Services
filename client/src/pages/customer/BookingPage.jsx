import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkerById, createBooking } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BookingPage() {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    serviceName: '', description: '', date: '', time: '',
    address: '', notes: '', isEmergency: false
  });

  useEffect(() => {
    getWorkerById(workerId).then(res => {
      setWorker(res.data);
      setForm(f => ({ ...f, serviceName: res.data.primarySkill || '' }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBooking({
        workerId,
        serviceName: form.serviceName,
        description: form.description,
        address: { full: form.address, city: user?.location?.city || 'Bareilly' },
        date: form.date,
        time: form.time,
        estimatedPrice: worker?.startingPrice || 299,
        notes: form.notes,
        isEmergency: form.isEmergency
      });
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!worker) return <div className="empty-state"><h3>Worker not found</h3></div>;

  if (success) {
    return (
      <div className="loading-page">
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Book Service</h1>
        <p>Complete the form to book your service</p>
      </div>

      {/* Worker Info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="worker-card-header">
          <div className="worker-avatar">
            {(worker.userName || 'W').charAt(0).toUpperCase()}
          </div>
          <div className="worker-info">
            <h3>{worker.userName || 'Worker'}</h3>
            <span className="skill">{worker.primarySkill}</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)' }}>₹{worker.startingPrice}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>starting price</div>
          </div>
        </div>
        <div className="worker-meta">
          <div className="worker-meta-item">⭐ <span className="value">{worker.rating}</span></div>
          <div className="worker-meta-item">🛠️ <span className="value">{worker.experience} yrs</span></div>
          <div className="worker-meta-item">✅ <span className="value">{worker.completedJobs} jobs</span></div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Booking Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service</label>
            <select name="serviceName" value={form.serviceName} onChange={handleChange} required>
              <option value="">Select service</option>
              {(worker.skills || [worker.primarySkill]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" placeholder="Describe the work needed..." value={form.description} onChange={handleChange} rows={3} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Preferred Time</label>
              <select name="time" value={form.time} onChange={handleChange} required>
                <option value="">Select time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input name="address" placeholder="Full address for service" value={form.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Additional Notes (optional)</label>
            <textarea name="notes" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} rows={2} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" name="isEmergency" checked={form.isEmergency} onChange={handleChange} style={{ width: 'auto' }} />
              <span>🚨 This is an emergency (priority response)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? 'Booking...' : `Confirm Booking • ₹${worker.startingPrice}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
