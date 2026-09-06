import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkerById, createBooking } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function BookingPage() {
  const { t } = useTranslation();
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
      alert(e.response?.data?.message || t('booking.failed'));
    }
    setSubmitting(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!worker) return <div className="empty-state"><h3>{t('booking.workerNotFound')}</h3></div>;

  if (success) {
    return (
      <div className="loading-page">
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2>{t('booking.confirmed')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{t('booking.redirecting')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('booking.title')}</h1>
        <p>{t('booking.subtitle')}</p>
      </div>

      {/* Worker Info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="worker-card-header">
          <div className="worker-avatar">
            {(worker.userName || 'W').charAt(0).toUpperCase()}
          </div>
          <div className="worker-info">
            <h3>{worker.userName || t('common.worker')}</h3>
            <span className="skill">{worker.primarySkill}</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)' }}>₹{worker.startingPrice}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('booking.startingPrice')}</div>
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>{t('booking.details')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('booking.service')}</label>
            <select name="serviceName" value={form.serviceName} onChange={handleChange} required>
              <option value="">{t('booking.selectService')}</option>
              {(worker.skills || [worker.primarySkill]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('booking.description')}</label>
            <textarea name="description" placeholder={t('booking.descriptionPlaceholder')} value={form.description} onChange={handleChange} rows={3} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('booking.date')}</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>{t('booking.preferredTime')}</label>
              <select name="time" value={form.time} onChange={handleChange} required>
                <option value="">{t('booking.selectTime')}</option>
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
            <label>{t('booking.address')}</label>
            <input name="address" placeholder={t('booking.addressPlaceholder')} value={form.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t('booking.notes')}</label>
            <textarea name="notes" placeholder={t('booking.notesPlaceholder')} value={form.notes} onChange={handleChange} rows={2} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" name="isEmergency" checked={form.isEmergency} onChange={handleChange} style={{ width: 'auto' }} />
              <span>🚨 {t('booking.emergency')}</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? t('booking.booking') : t('booking.confirm', { price: worker.startingPrice })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
