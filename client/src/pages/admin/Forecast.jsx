import { useState, useEffect } from 'react';
import { getDemandForecast, getWorkforceAllocation } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';

export default function AdminForecast() {
  const [forecast, setForecast] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('forecast');

  useEffect(() => {
    Promise.all([
      getDemandForecast().catch(() => ({ data: null })),
      getWorkforceAllocation().catch(() => ({ data: null }))
    ]).then(([fRes, aRes]) => {
      setForecast(fRes.data);
      setAllocation(aRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const forecastData = forecast?.forecast || [];
  const historicalData = forecast?.historical || [];
  const allocations = allocation?.allocations || [];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Demand Forecasting & Workforce Allocation</h1>
        <p>AI-powered demand prediction and smart resource allocation</p>
      </div>

      <div className="tabs" style={{ marginBottom: '32px' }}>
        <button className={`tab ${tab === 'forecast' ? 'active' : ''}`} onClick={() => setTab('forecast')}>📊 Demand Forecast</button>
        <button className={`tab ${tab === 'historical' ? 'active' : ''}`} onClick={() => setTab('historical')}>📈 Historical Trends</button>
        <button className={`tab ${tab === 'allocation' ? 'active' : ''}`} onClick={() => setTab('allocation')}>🗺️ Workforce Allocation</button>
      </div>

      {/* Demand Forecast Tab */}
      {tab === 'forecast' && (
        <div>
          <div className="grid-2" style={{ marginBottom: '32px' }}>
            <div className="chart-container">
              <h3>Expected Demand vs Current Workers</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={forecastData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#72738C" fontSize={12} />
                  <YAxis type="category" dataKey="service" stroke="#72738C" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ background: '#232145', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="currentWorkers" fill="#6C5CE7" name="Current Workers" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="expectedDemand" fill="#00D2D3" name="Expected Demand" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-container">
              <h3>Growth Predictions</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="service" stroke="#72738C" fontSize={10} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#72738C" fontSize={12} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: '#232145', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} formatter={v => `${v}%`} />
                  <Bar dataKey="growthPercent" name="Growth %" radius={[4, 4, 0, 0]}>
                    {forecastData.map((entry, i) => (
                      <Cell key={i} fill={entry.growthPercent > 0 ? '#00B894' : '#E17055'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Cards */}
          <div className="grid-3">
            {forecastData.map((f, i) => (
              <div className="card" key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{f.icon}</span>
                    <span style={{ fontWeight: 700 }}>{f.service}</span>
                  </div>
                  <span className={`badge ${f.trend === 'up' ? 'badge-success' : f.trend === 'down' ? 'badge-danger' : 'badge-info'}`}>
                    {f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'} {f.growthPercent}%
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Current:</span> <strong>{f.currentWorkers}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Expected:</span> <strong>{f.expectedDemand}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Confidence:</span> <strong>{f.confidence}%</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Need:</span> <strong style={{ color: f.recommended > 0 ? 'var(--warning)' : 'var(--success)' }}>{f.recommended > 0 ? `+${f.recommended}` : 'OK'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Tab */}
      {tab === 'historical' && (
        <div className="chart-container">
          <h3>Historical Demand by Service (12 Months)</h3>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#72738C" fontSize={12} />
              <YAxis stroke="#72738C" fontSize={12} />
              <Tooltip contentStyle={{ background: '#232145', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="Plumbing" stroke="#6C5CE7" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Electrical" stroke="#FDCB6E" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="AC Repair" stroke="#00D2D3" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Cleaning" stroke="#00B894" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Carpentry" stroke="#E17055" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Allocation Tab */}
      {tab === 'allocation' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allocations.map((area, i) => (
              <div className="card" key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📍 {area.area}</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Service</th><th>Available</th><th>Required</th><th>Shortage</th><th>Urgency</th></tr>
                    </thead>
                    <tbody>
                      {area.services.map((s, j) => (
                        <tr key={j}>
                          <td style={{ fontWeight: 600 }}>{s.service}</td>
                          <td>{s.available}</td>
                          <td>{s.required}</td>
                          <td style={{ color: s.shortage > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                            {s.shortage > 0 ? `-${s.shortage}` : '✓ OK'}
                          </td>
                          <td>
                            <span className={`badge ${s.urgency === 'critical' ? 'badge-danger' : s.urgency === 'high' ? 'badge-warning' : s.urgency === 'medium' ? 'badge-info' : 'badge-success'}`}>
                              {s.urgency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {area.recommendation?.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(108,92,231,0.08)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: '4px' }}>💡 Recommendations</div>
                    {area.recommendation.map((r, k) => (
                      <div key={k} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {r}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
