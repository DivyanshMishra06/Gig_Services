import { useState, useEffect } from 'react';
import { getWorkerWelfare } from '../../services/api';

export default function WorkerWelfare() {
  const [welfare, setWelfare] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerWelfare().then(res => {
      setWelfare(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const data = welfare || {
    benefits: [
      { name: 'Health Insurance', status: 'Active', icon: '🏥' },
      { name: 'Accident Coverage', status: 'Active', icon: '🛡️' },
      { name: 'Training Programs', status: '3 courses completed', icon: '📚' },
      { name: 'Health Support', status: 'Eligible', icon: '❤️' },
      { name: 'Emergency Support', status: 'Available', icon: '🚨' }
    ],
    workerContribution: 100,
    cooperativeContribution: 200,
    totalWelfareFund: 300
  };

  const trainingPrograms = [
    { name: 'Safety & First Aid', status: 'Completed', duration: '2 hours', icon: '🏥', badge: 'badge-success' },
    { name: 'Customer Communication', status: 'Completed', duration: '1.5 hours', icon: '💬', badge: 'badge-success' },
    { name: 'Digital Payments & UPI', status: 'Completed', duration: '1 hour', icon: '📱', badge: 'badge-success' },
    { name: 'Advanced Skill Certification', status: 'Available', duration: '4 hours', icon: '🎓', badge: 'badge-info' },
    { name: 'Financial Literacy', status: 'Available', duration: '2 hours', icon: '💰', badge: 'badge-info' }
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Welfare Benefits</h1>
        <p>Your cooperative welfare coverage and training programs</p>
      </div>

      {/* Welfare Fund Stats */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{data.workerContribution}</div>
          <div className="stat-label">Your Contribution</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-value">₹{data.cooperativeContribution}</div>
          <div className="stat-label">Cooperative Contribution</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>₹{data.totalWelfareFund}</div>
          <div className="stat-label">Total Welfare Fund</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Benefits */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Your Benefits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(data.benefits || []).map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '2rem' }}>{b.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{b.name}</div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: b.status === 'Active' || b.status === 'Available' || b.status === 'Eligible'
                      ? 'var(--success)' : 'var(--text-secondary)'
                  }}>
                    {b.status}
                  </div>
                </div>
                {(b.status === 'Active' || b.status === 'Available' || b.status === 'Eligible') && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Training */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Training Programs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trainingPrograms.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.duration}</div>
                </div>
                <span className={`badge ${t.badge}`}>{t.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(11,143,77,0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--primary)' }}>
            📚 Complete training programs to earn certifications and increase your profile visibility.
          </div>
        </div>
      </div>

      {/* Cooperative Message */}
      <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(11,143,77,0.06), rgba(245,130,58,0.06))' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>🤝 Your Cooperative Advantage</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
          As a cooperative member, you own a share of the platform. Your 5% contribution goes directly to the welfare fund
          — covering health insurance, accident coverage, emergency support, and skill training. Unlike traditional gig platforms,
          there are no hidden fees or high commissions. Your cooperative, your rules.
        </p>
      </div>
    </div>
  );
}
