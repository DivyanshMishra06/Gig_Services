import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWorkers } from '../../services/api';

export default function WorkerSearch() {
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [sort, setSort] = useState('');
  const [location, setLocation] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minExperience, setMinExperience] = useState('');

  useEffect(() => {
    setSkill(searchParams.get('skill') || '');
    setLocation(searchParams.get('city') || '');
  }, [searchParams]);

  useEffect(() => {
    loadWorkers();
  }, [skill, location, minPrice, maxPrice, minExperience, sort]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (skill) params.skill = skill;
      if (location.trim()) params.city = location.trim();
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (minExperience !== '') params.minExperience = minExperience;
      if (sort) params.sort = sort;
      params.verified = 'true';
      const { data } = await getWorkers(params);
      setWorkers(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const clearFilters = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setMinExperience('');
    setSort('');
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Find Workers {skill && `— ${skill}`}{location && ` in ${location}`}</h1>
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

      <div className="filters-bar" style={{ marginTop: '12px', alignItems: 'center' }}>
        <input className="filter-select" type="text" placeholder="Location / city" value={location} onChange={e => setLocation(e.target.value)} aria-label="Filter by location" />
        <input className="filter-select" type="number" min="0" placeholder="Min price (₹)" value={minPrice} onChange={e => setMinPrice(e.target.value)} aria-label="Minimum starting price" />
        <input className="filter-select" type="number" min="0" placeholder="Max price (₹)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} aria-label="Maximum starting price" />
        <select className="filter-select" value={minExperience} onChange={e => setMinExperience(e.target.value)} aria-label="Minimum experience">
          <option value="">Any experience</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
        </select>
        <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>
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
                {w.location?.city && <div className="worker-meta-item">📍 <span className="value">{w.location.city}</span></div>}
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
