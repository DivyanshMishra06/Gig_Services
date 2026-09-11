import { useState, useEffect } from 'react';
import { getAdminWorkers, verifyWorker } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function AdminWorkers() {
  const { t } = useTranslation();
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
    } catch (e) { alert(t('adminWorkers.failedVerification')); }
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
        <h1>{t('adminWorkers.title')}</h1>
        <p>{t('adminWorkers.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{workers.length}</div>
          <div className="stat-label">{t('adminWorkers.totalWorkers')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{workers.filter(w => w.verificationStatus === 'verified').length}</div>
          <div className="stat-label">{t('adminWorkers.verified')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{workers.filter(w => w.verificationStatus === 'pending').length}</div>
          <div className="stat-label">{t('adminWorkers.pendingVerification')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input placeholder={t('adminWorkers.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">{t('adminWorkers.allStatus')}</option>
          <option value="pending">{t('adminWorkers.pending')}</option>
          <option value="verified">{t('adminWorkers.verifiedStatus')}</option>
          <option value="rejected">{t('adminWorkers.rejected')}</option>
        </select>
      </div>

      {/* Workers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('adminWorkers.worker')}</th><th>{t('adminWorkers.skill')}</th><th>{t('adminWorkers.cooperative')}</th><th>{t('adminWorkers.experience')}</th><th>{t('adminWorkers.rating')}</th><th>{t('adminWorkers.jobs')}</th><th>{t('adminWorkers.status')}</th><th>{t('adminWorkers.actions')}</th>
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
                  <td>{w.experience} {t('adminWorkers.yrs')}</td>
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
                        <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleVerify(w._id, 'verified')}>✓ {t('adminWorkers.verify')}</button>
                        <button className="btn btn-danger btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleVerify(w._id, 'rejected')}>✗ {t('adminWorkers.reject')}</button>
                      </div>
                    ) : w.verificationStatus === 'verified' ? (
                      <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ {t('adminWorkers.activeLabel')}</span>
                    ) : (
                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleVerify(w._id, 'verified')}>{t('adminWorkers.reVerify')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state"><h3>{t('adminWorkers.noWorkers')}</h3></div>
        )}
      </div>
    </div>
  );
}
