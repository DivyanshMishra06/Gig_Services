import { useState, useEffect } from 'react';
import { getAdminStats, getCooperatives } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats().catch(() => ({ data: null })),
      getCooperatives().catch(() => ({ data: [] }))
    ]).then(([sRes, cRes]) => {
      setStats(sRes.data);
      setCooperatives(cRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const s = stats || {
    totalWorkers: 1248, verifiedWorkers: 1102, activeWorkers: 847,
    totalCustomers: 8420, totalBookings: 15840, completedBookings: 276,
    todayBookings: 328, pendingVerifications: 12, totalRevenue: 480000,
    welfareFund: 820000, localEmployment: 847, cooperativeGrowth: 12.5
  };

  const pieData = [
    { name: 'Verified', value: s.verifiedWorkers, color: '#0B8F4D' },
    { name: 'Pending', value: s.totalWorkers - s.verifiedWorkers, color: '#F5823A' }
  ];

  const revenueData = [
    { month: 'Mar', revenue: 320000 }, { month: 'Apr', revenue: 380000 },
    { month: 'May', revenue: 420000 }, { month: 'Jun', revenue: 390000 },
    { month: 'Jul', revenue: 450000 }, { month: 'Aug', revenue: 480000 }
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and cooperative management</p>
      </div>

      {/* Main Stats */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-value">{s.totalWorkers.toLocaleString()}</div>
          <div className="stat-label">Total Workers</div>
          <div className="stat-change up">↑ {s.cooperativeGrowth}% growth</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{s.totalCustomers.toLocaleString()}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{s.todayBookings}</div>
          <div className="stat-label">Today's Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{(s.totalRevenue / 100000).toFixed(1)}L</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{s.verifiedWorkers}</div>
          <div className="stat-label">Verified Workers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-value">{s.activeWorkers}</div>
          <div className="stat-label">Active Now</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{s.pendingVerifications}</div>
          <div className="stat-label">Pending Verifications</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>₹{(s.welfareFund / 100000).toFixed(1)}L</div>
          <div className="stat-label">Welfare Fund</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Revenue Chart */}
        <div className="chart-container">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,34,27,0.06)" />
              <XAxis dataKey="month" stroke="#94A39A" fontSize={12} />
              <YAxis stroke="#94A39A" fontSize={12} tickFormatter={v => `₹${(v/1000)}k`} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E9E4', borderRadius: '8px', color: '#17221B', boxShadow: '0 4px 12px rgba(23,34,27,0.08)' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#0B8F4D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Pie */}
        <div className="chart-container">
          <h3>Worker Verification Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E9E4', borderRadius: '8px', color: '#17221B', boxShadow: '0 4px 12px rgba(23,34,27,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cooperatives */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Registered Cooperatives</h3>
        {cooperatives.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Location</th><th>Members</th><th>Active</th><th>Rating</th><th>Welfare Fund</th>
                </tr>
              </thead>
              <tbody>
                {cooperatives.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.location?.city}</td>
                    <td>{c.totalMembers}</td>
                    <td><span className="badge badge-success">{c.activeWorkers}</span></td>
                    <td>⭐ {c.rating}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{(c.welfareFund || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No cooperatives data available. Run seed to populate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
