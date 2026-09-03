import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWorkers } from '../../services/api';

export default function WorkerSearch() {
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [sort, setSort] = useState('');
  const city = searchParams.get('city') || '';

  useEffect(() => {
    setSkill(searchParams.get('skill') || '');
  }, [searchParams]);

  useEffect(() => {
    loadWorkers();
  }, [skill, sort, city]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (skill) params.skill = skill;
      if (city) params.city = city;
      if (sort) params.sort = sort;
      params.verified = 'true';
      const { data } = await getWorkers(params);
      setWorkers(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Find Workers {skill && `— ${skill}`}{city && ` in ${city}`}</h1>
        <p>Verified cooperative workers near you</p>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by skill (e.g. Plumbing, Electrical)..."
            value={skill}
            onChange={e => setSkill(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Best Match</option>
          <option value="rating">Top Rated</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '300px' }}><div className="spinner" /></div>
      ) : workers.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👷</div>
          <h3>No workers found</h3>
          <p>Try a different search or remove filters</p>
        </div>
      ) : (
        <div className="grid-2">
          {workers.map(w => (
            <div className="worker-card" key={w._id}>
              <div className="worker-card-header">
                <div className="worker-avatar">
                  {(w.userName || w.userId?.name || 'W').charAt(0).toUpperCase()}
                </div>
                <div className="worker-info">
                  <h3>{w.userName || w.userId?.name || 'Worker'}</h3>
                  <span className="skill">{w.primarySkill}</span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div className={`badge ${w.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                    {w.verificationStatus === 'verified' ? '✓ Verified' : 'Pending'}
                  </div>
                </div>
              </div>

              <div className="worker-meta">
                <div className="worker-meta-item">⭐ <span className="value">{w.rating || '0'}</span> ({w.totalRatings || 0})</div>
                <div className="worker-meta-item">🛠️ <span className="value">{w.experience || 0}</span> yrs</div>
                <div className="worker-meta-item">✅ <span className="value">{w.completedJobs || 0}</span> jobs</div>
                {w._distance && <div className="worker-meta-item">📍 <span className="value">{w._distance}</span> km</div>}
              </div>

              {w.cooperativeName && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  🤝 {w.cooperativeName}
                </p>
              )}

              {w.bio && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                  {w.bio.length > 100 ? w.bio.slice(0, 100) + '...' : w.bio}
                </p>
              )}

              <div className="worker-card-footer">
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>₹{w.startingPrice || 199}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> onwards</span>
                </div>
                <Link to={`/book/${w._id}`} className="btn btn-primary btn-sm">Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
