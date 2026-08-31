import { useState, useEffect } from 'react';
import { getAdminWorkers, verifyWorker } from '../../services/api';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadWorkers(); }, []);

  const loadWorkers = async () => {
    try {
      const { data } = await getAdminWorkers();
      setWorkers(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleVerify = async (id, status) => {
    try {
      await verifyWorker(id, { status });
      loadWorkers();
    } catch (e) { alert('Failed to update verification'); }
  };

  const filtered = workers.filter(w => {
    const matchesFilter = filter === 'all' || w.verificationStatus === filter;
    const matchesSearch = !search ||
      (w.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.primarySkill || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.cooperativeName || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Worker Management</h1>
        <p>Verify workers and manage cooperative memberships</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{workers.length}</div>
          <div className="stat-label">Total Workers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{workers.filter(w => w.verificationStatus === 'verified').length}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{workers.filter(w => w.verificationStatus === 'pending').length}</div>
          <div className="stat-label">Pending Verification</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Workers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th><th>Skill</th><th>Cooperative</th><th>Experience</th><th>Rating</th><th>Jobs</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="worker-avatar" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                        {(w.userName || 'W').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{w.userName || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.userEmail || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{w.primarySkill}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{w.cooperativeName || '—'}</td>
                  <td>{w.experience} yrs</td>
                  <td>⭐ {w.rating || 0}</td>
                  <td>{w.completedJobs || 0}</td>
                  <td>
                    <span className={`badge ${w.verificationStatus === 'verified' ? 'badge-success' : w.verificationStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {w.verificationStatus}
                    </span>
                  </td>
                  <td>
                    {w.verificationStatus === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleVerify(w._id, 'verified')}>✓ Verify</button>
                        <button className="btn btn-danger btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleVerify(w._id, 'rejected')}>✗ Reject</button>
                      </div>
                    ) : w.verificationStatus === 'verified' ? (
                      <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Active</span>
                    ) : (
                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleVerify(w._id, 'verified')}>Re-verify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state"><h3>No workers found</h3></div>
        )}
      </div>
    </div>
  );
}
