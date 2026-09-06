import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSearch = searchParams.get('from') === 'search';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (fromSearch) {
        navigate('/?focusSearch=true');
      } else if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'worker') navigate('/worker');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <h1>{t('auth.welcomeBack')}</h1>
        <p className="subtitle">{t('auth.signInSubtitle')}</p>

        {error && (
          <div style={{ background: 'rgba(225,112,85,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', color: 'var(--danger)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input type="email" placeholder={t('auth.enterEmail')} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input type="password" placeholder={t('auth.enterPassword')} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>{t('auth.quickDemo')}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => quickLogin('customer@demo.com', 'customer123')}>👤 {t('auth.customer')}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => quickLogin('ramesh@demo.com', 'worker123')}>🔧 {t('auth.worker')}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => quickLogin('admin@activesetu.com', 'admin123')}>⚙️ {t('auth.admin')}</button>
          </div>
        </div>

        <div className="auth-footer">
          {t('auth.noAccount')} <Link to="/register">{t('auth.createOne')}</Link>
        </div>
      </div>
    </div>
  );
}
