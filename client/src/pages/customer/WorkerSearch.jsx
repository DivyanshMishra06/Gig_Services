import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWorkers } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function WorkerSearch() {
  const { t } = useTranslation();
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
        <h1>{t('search.title', { skill: skill ? ` — ${skill}` : '', city: city ? t('search.inCity', { city }) : '' })}</h1>
        <p>{t('search.subtitle')}</p>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            placeholder={t('search.placeholder')}
            value={skill}
            onChange={e => setSkill(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">{t('common.bestMatch')}</option>
          <option value="rating">{t('common.topRated')}</option>
          <option value="price">{t('common.lowestPrice')}</option>
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
          <h3>{t('common.noWorkers')}</h3>
          <p>{t('common.tryDifferentSearch')}</p>
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
                  <h3>{w.userName || w.userId?.name || t('common.worker')}</h3>
                  <span className="skill">{w.primarySkill}</span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div className={`badge ${w.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                    {w.verificationStatus === 'verified' ? `✓ ${t('common.verified')}` : t('common.pending')}
                  </div>
                </div>
              </div>

              <div className="worker-meta">
                <div className="worker-meta-item">⭐ <span className="value">{w.rating || '0'}</span> ({w.totalRatings || 0})</div>
                <div className="worker-meta-item">🛠️ <span className="value">{w.experience || 0}</span> {t('search.years')}</div>
                <div className="worker-meta-item">✅ <span className="value">{w.completedJobs || 0}</span> {t('search.jobs')}</div>
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> {t('common.onwards')}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/workers/${w._id}`} className="btn btn-secondary btn-sm">View profile</Link>
                  <Link to={`/book/${w._id}`} className="btn btn-primary btn-sm">{t('common.bookNow')}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
