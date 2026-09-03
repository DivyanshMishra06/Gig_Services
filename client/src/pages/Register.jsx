import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
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
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in" style={{ maxWidth: '500px' }}>
        <h1>Join CoopGig</h1>
        <p className="subtitle">Create your account and start {form.role === 'worker' ? 'earning' : 'booking services'}</p>

        {error && (
          <div style={{ background: 'rgba(225,112,85,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', color: 'var(--danger)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Role Tabs */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button className={`tab ${form.role === 'customer' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'customer' })}>👤 Customer</button>
          <button className={`tab ${form.role === 'worker' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'worker' })}>🔧 Worker</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" placeholder="Enter your full name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {form.role === 'worker' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Skill</label>
                  <select name="primarySkill" value={form.primarySkill} onChange={handleChange} required>
                    <option value="">Select skill</option>
                    <option>Plumbing</option><option>Electrical</option><option>AC Repair</option>
                    <option>Cleaning</option><option>Carpentry</option><option>Painting</option>
                    <option>Appliance Repair</option><option>Home Caregiver</option><option>Driver</option>
                    <option>Gardening</option><option>Beauty & Salon</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Cooperative Name (optional)</label>
                <input name="cooperativeName" placeholder="e.g. Bareilly Skilled Workers Cooperative" value={form.cooperativeName} onChange={handleChange} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
