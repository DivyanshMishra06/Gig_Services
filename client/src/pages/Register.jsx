import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const PRIMARY_SKILLS = [
  { value: 'Plumbing', labelKey: 'plumbing' },
  { value: 'Electrical', labelKey: 'electrical' },
  { value: 'AC Repair', labelKey: 'acRepair' },
  { value: 'Cleaning', labelKey: 'cleaning' },
  { value: 'Carpentry', labelKey: 'carpentry' },
  { value: 'Painting', labelKey: 'painting' },
  { value: 'Appliance Repair', labelKey: 'applianceRepair' },
  { value: 'Home Caregiver', labelKey: 'homeCaregiver' },
  { value: 'Driver', labelKey: 'driver' },
  { value: 'Gardening', labelKey: 'gardening' },
  { value: 'Beauty & Salon', labelKey: 'beautySalon' },
  { value: 'Home Cook', labelKey: 'homeCook' },
  { value: 'Dishwashing', labelKey: 'dishwashing' }
];

export default function Register() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: defaultRole, primarySkill: '', cooperativeName: '', experience: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      const fromSearch = searchParams.get('from') === 'search';
      if (fromSearch) {
        navigate('/?focusSearch=true');
      } else if (data.role === 'worker') navigate('/worker');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in" style={{ maxWidth: '500px' }}>
        <button type="button" className="public-back-button" onClick={() => navigate(-1)}>← {t('nav.back')}</button>
        <h1>{t('auth.join')}</h1>
        <p className="subtitle">{t('auth.createStart', { activity: form.role === 'worker' ? t('auth.earning') : t('auth.bookingServices') })}</p>

        {error && (
          <div style={{ background: 'rgba(225,112,85,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', color: 'var(--danger)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Role Tabs */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button className={`tab ${form.role === 'customer' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'customer' })}>👤 {t('auth.customer')}</button>
          <button className={`tab ${form.role === 'worker' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'worker' })}>🔧 {t('auth.worker')}</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.fullName')}</label>
            <input name="name" placeholder={t('auth.enterFullName')} value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t('auth.phone')}</label>
              <input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input name="password" type="password" placeholder={t('auth.minCharacters')} value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {form.role === 'worker' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('auth.primarySkill')}</label>
                  <select name="primarySkill" value={form.primarySkill} onChange={handleChange} required>
                    <option value="">{t('auth.selectSkill')}</option>
                    {PRIMARY_SKILLS.map(({ value, labelKey }) => (
                      <option key={value} value={value}>{t(`auth.skills.${labelKey}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('auth.experienceYears')}</label>
                  <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>{t('auth.cooperativeName')}</label>
                <input name="cooperativeName" placeholder="e.g. Bareilly Skilled Workers Cooperative" value={form.cooperativeName} onChange={handleChange} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('auth.creating') : t('auth.createAccount')}
          </button>
        </form>

        <div className="auth-footer">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.signIn')}</Link>
        </div>
      </div>
    </div>
  );
}
