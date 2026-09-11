import { useState, useEffect } from 'react';
import { getWorkerEarnings } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function WorkerEarnings() {
  const { t } = useTranslation();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerEarnings().then(res => {
      setEarnings(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const data = earnings || {
    today: 1200, weekly: 8500, monthly: 32000, total: 185000,
    completedJobs: 280, cooperativeContribution: 1600, netEarnings: 30400,
    history: [
      { month: 'Mar', earnings: 22000, jobs: 18 }, { month: 'Apr', earnings: 28000, jobs: 22 },
      { month: 'May', earnings: 31000, jobs: 25 }, { month: 'Jun', earnings: 26000, jobs: 20 },
      { month: 'Jul', earnings: 35000, jobs: 28 }, { month: 'Aug', earnings: 32000, jobs: 24 },
      { month: 'Sep', earnings: 38000, jobs: 30 }
    ]
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('workerEarnings.title')}</h1>
        <p>{t('workerEarnings.subtitle')}</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{data.today?.toLocaleString()}</div>
          <div className="stat-label">{t('workerEarnings.todaysEarnings')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">₹{data.weekly?.toLocaleString()}</div>
          <div className="stat-label">{t('workerEarnings.thisWeek')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">₹{data.monthly?.toLocaleString()}</div>
          <div className="stat-label">{t('workerEarnings.thisMonth')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">₹{data.total?.toLocaleString()}</div>
          <div className="stat-label">{t('workerEarnings.totalEarned')}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Earnings Chart */}
        <div className="chart-container">
          <h3>{t('workerEarnings.monthlyEarnings')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,34,27,0.06)" />
              <XAxis dataKey="month" stroke="#94A39A" fontSize={12} />
              <YAxis stroke="#94A39A" fontSize={12} tickFormatter={v => `₹${(v/1000)}k`} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E9E4', borderRadius: '8px', color: '#17221B', boxShadow: '0 4px 12px rgba(23,34,27,0.08)' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, t('workerEarnings.earningsTooltip')]}
              />
              <Bar dataKey="earnings" fill="#0B8F4D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Jobs Chart */}
        <div className="chart-container">
          <h3>{t('workerEarnings.jobsCompleted')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,34,27,0.06)" />
              <XAxis dataKey="month" stroke="#94A39A" fontSize={12} />
              <YAxis stroke="#94A39A" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E9E4', borderRadius: '8px', color: '#17221B', boxShadow: '0 4px 12px rgba(23,34,27,0.08)' }}
              />
              <Line type="monotone" dataKey="jobs" stroke="#F5823A" strokeWidth={2} dot={{ fill: '#F5823A', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>{t('workerEarnings.monthlyBreakdown')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('workerEarnings.grossEarnings')}</span>
            <span style={{ fontWeight: 700 }}>₹{data.monthly?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('workerEarnings.cooperativeContribution')}</span>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>-₹{data.cooperativeContribution?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('workerEarnings.platformFee')}</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('workerEarnings.netEarnings')}</span>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>₹{data.netEarnings?.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(11,143,77,0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--success)' }}>
          💡 {t('workerEarnings.cooperativeMessage')}
        </div>
      </div>
    </div>
  );
}
