import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getNearbyWorkers, getWorkers } from '../../services/api';
import LocationPicker from '../../components/LocationPicker';
import { useTranslation } from 'react-i18next';

export default function WorkerSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [sort, setSort] = useState('');
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minExperience, setMinExperience] = useState('');

  useEffect(() => {
    setSkill(searchParams.get('skill') || '');
    setCity(searchParams.get('city') || '');
  }, [searchParams]);

  useEffect(() => {
    loadWorkers();
  }, [skill, sort, city, location, minPrice, maxPrice, minExperience]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (skill) params.skill = skill;
      if (city.trim()) params.city = city.trim();
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (minExperience !== '') params.minExperience = minExperience;
      if (sort) params.sort = sort;
      params.verified = 'true';
      const { data } = location?.coordinates?.length === 2
        ? await getNearbyWorkers({
          longitude: location.coordinates[0],
          latitude: location.coordinates[1],
          radius: 20,
          ...(skill ? { skill } : {})
        })
        : await getWorkers(params);
      setWorkers(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const clearFilters = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinExperience('');
    setSort('');
    setLocation(null);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button type="button" className="public-back-button" onClick={() => navigate(-1)}>← {t('nav.back')}</button>
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
      <div style={{ maxWidth: '620px', marginBottom: '20px' }}>
        <LocationPicker value={location} onChange={setLocation} />
        {location && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>{t('search.locationHint')}</p>}
      </div>

      <div className="filters-bar" style={{ marginTop: '12px', alignItems: 'center' }}>
        <input className="filter-select" type="text" placeholder="Location / city" value={city} onChange={e => setCity(e.target.value)} aria-label="Filter by location" />
        <input className="filter-select" type="number" min="0" placeholder="Min price (₹)" value={minPrice} onChange={e => setMinPrice(e.target.value)} aria-label="Minimum starting price" />
        <input className="filter-select" type="number" min="0" placeholder="Max price (₹)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} aria-label="Maximum starting price" />
        <select className="filter-select" value={minExperience} onChange={e => setMinExperience(e.target.value)} aria-label="Minimum experience">
          <option value="">Any experience</option><option value="3">3+ years</option><option value="5">5+ years</option><option value="10">10+ years</option>
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
                {(w.distance ?? w._distance) !== undefined && <div className="worker-meta-item">📍 <span className="value">{w.distance ?? w._distance}</span> {t('search.kmAway')}</div>}
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
                  <Link to={`/workers/${w._id}`} className="btn btn-secondary btn-sm">{t('search.viewProfile')}</Link>
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
