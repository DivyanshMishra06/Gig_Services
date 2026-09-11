import { useState, useEffect } from 'react';
import { getWorkerWelfare } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function WorkerWelfare() {
  const { t } = useTranslation();
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
      { name: t('workerWelfare.healthInsurance'), status: t('workerWelfare.active'), icon: '🏥' },
      { name: t('workerWelfare.accidentCoverage'), status: t('workerWelfare.active'), icon: '🛡️' },
      { name: t('workerWelfare.trainingPrograms'), status: t('workerWelfare.coursesCompleted'), icon: '📚' },
      { name: t('workerWelfare.healthSupport'), status: t('workerWelfare.eligible'), icon: '❤️' },
      { name: t('workerWelfare.emergencySupport'), status: t('workerWelfare.available'), icon: '🚨' }
    ],
    workerContribution: 100,
    cooperativeContribution: 200,
    totalWelfareFund: 300
  };

  const activeStatuses = [t('workerWelfare.active'), t('workerWelfare.available'), t('workerWelfare.eligible')];

  const trainingPrograms = [
    { name: t('workerWelfare.safetyFirstAid'), status: t('workerWelfare.completed'), duration: '2 hours', icon: '🏥', badge: 'badge-success' },
    { name: t('workerWelfare.customerCommunication'), status: t('workerWelfare.completed'), duration: '1.5 hours', icon: '💬', badge: 'badge-success' },
    { name: t('workerWelfare.digitalPayments'), status: t('workerWelfare.completed'), duration: '1 hour', icon: '📱', badge: 'badge-success' },
    { name: t('workerWelfare.advancedCertification'), status: t('workerWelfare.available'), duration: '4 hours', icon: '🎓', badge: 'badge-info' },
    { name: t('workerWelfare.financialLiteracy'), status: t('workerWelfare.available'), duration: '2 hours', icon: '💰', badge: 'badge-info' }
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('workerWelfare.title')}</h1>
        <p>{t('workerWelfare.subtitle')}</p>
      </div>

      {/* Welfare Fund Stats */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{data.workerContribution}</div>
          <div className="stat-label">{t('workerWelfare.yourContribution')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-value">₹{data.cooperativeContribution}</div>
          <div className="stat-label">{t('workerWelfare.cooperativeContribution')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>₹{data.totalWelfareFund}</div>
          <div className="stat-label">{t('workerWelfare.totalWelfareFund')}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Benefits */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>{t('workerWelfare.yourBenefits')}</h3>
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
                    color: activeStatuses.includes(b.status) ? 'var(--success)' : 'var(--text-secondary)'
                  }}>
                    {b.status}
                  </div>
                </div>
                {activeStatuses.includes(b.status) && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Training */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>{t('workerWelfare.trainingTitle')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trainingPrograms.map((tp, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>{tp.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '0.95rem' }}>{tp.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tp.duration}</div>
                </div>
                <span className={`badge ${tp.badge}`}>{tp.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(11,143,77,0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--primary)' }}>
            📚 {t('workerWelfare.trainingMessage')}
          </div>
        </div>
      </div>

      {/* Cooperative Message */}
      <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(11,143,77,0.06), rgba(245,130,58,0.06))' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>🤝 {t('workerWelfare.cooperativeAdvantage')}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
          {t('workerWelfare.cooperativeMessage')}
        </p>
      </div>
    </div>
  );
}
