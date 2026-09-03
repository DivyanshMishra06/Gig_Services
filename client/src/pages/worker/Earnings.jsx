import { useState, useEffect } from 'react';
import { getWorkerEarnings } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function WorkerEarnings() {
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
        <h1>Earnings</h1>
        <p>Track your income and cooperative contributions</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{data.today?.toLocaleString()}</div>
          <div className="stat-label">Today's Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">₹{data.weekly?.toLocaleString()}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">₹{data.monthly?.toLocaleString()}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">₹{data.total?.toLocaleString()}</div>
          <div className="stat-label">Total Earned</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Earnings Chart */}
        <div className="chart-container">
          <h3>Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,34,27,0.06)" />
              <XAxis dataKey="month" stroke="#94A39A" fontSize={12} />
              <YAxis stroke="#94A39A" fontSize={12} tickFormatter={v => `₹${(v/1000)}k`} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E9E4', borderRadius: '8px', color: '#17221B', boxShadow: '0 4px 12px rgba(23,34,27,0.08)' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
              />
              <Bar dataKey="earnings" fill="#0B8F4D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Jobs Chart */}
        <div className="chart-container">
          <h3>Jobs Completed</h3>
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
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Monthly Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Gross Earnings</span>
            <span style={{ fontWeight: 700 }}>₹{data.monthly?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Cooperative Contribution (5%)</span>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>-₹{data.cooperativeContribution?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Platform Fee (0%)</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Net Earnings</span>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>₹{data.netEarnings?.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(11,143,77,0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--success)' }}>
          💡 Unlike gig platforms that take 20-30% commission, CoopGig cooperatives only charge 5% which goes to your welfare fund.
        </div>
      </div>
    </div>
  );
}
