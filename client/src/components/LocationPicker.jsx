import { useState } from 'react';
import { geocodeLocation } from '../services/api';
import { useTranslation } from 'react-i18next';

const roundCoordinate = value => Math.round(value * 10000) / 10000;

export default function LocationPicker({ value, onChange, actionLabel }) {
  const { t } = useTranslation();
  const resolvedActionLabel = actionLabel || t('location.useCurrentLocation');
  const [query, setQuery] = useState(value?.address || value?.city || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const geolocationError = error => {
    if (error.code === error.PERMISSION_DENIED) return t('location.permissionDenied');
    if (error.code === error.POSITION_UNAVAILABLE) return t('location.positionUnavailable');
    if (error.code === error.TIMEOUT) return t('location.timeout');
    return t('location.genericError');
  };

  const useCurrentLocation = () => {
    setMessage('');
    if (!navigator.geolocation) return setMessage(t('location.notSupported'));
    navigator.geolocation.getCurrentPosition(
      position => {
        onChange({ type: 'Point', coordinates: [roundCoordinate(position.coords.longitude), roundCoordinate(position.coords.latitude)], address: t('location.approximateLocation'), city: '' });
        setResults([]);
        setMessage(t('location.currentSelected'));
      },
      error => setMessage(geolocationError(error)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const findLocation = async () => {
    if (query.trim().length < 3) return setMessage(t('location.minChars'));
    setLoading(true); setMessage('');
    try {
      const { data } = await geocodeLocation(query.trim());
      setResults(data || []);
      if (!data?.length) setMessage(t('location.noResults'));
    } catch (error) {
      setMessage(error.response?.data?.message || t('location.searchError'));
    } finally { setLoading(false); }
  };

  const selectedLabel = value?.coordinates?.length === 2 ? (value.address || value.city || t('location.fallback')) : '';
  return <div className="form-group" style={{ marginTop: '12px' }}>
    <label>{t('location.label')}</label>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 10px' }}>{t('location.privacyNote')}</p>
    <button type="button" className="btn btn-secondary btn-sm" onClick={useCurrentLocation}>📍 {resolvedActionLabel}</button>
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
      <input aria-label={t('location.enterPlaceholder')} value={query} onChange={event => setQuery(event.target.value)} placeholder={t('location.enterPlaceholder')} />
      <button type="button" className="btn btn-secondary btn-sm" disabled={loading} onClick={findLocation}>{loading ? t('location.searching') : t('location.search')}</button>
    </div>
    {selectedLabel && <p style={{ color: 'var(--success, #198754)', fontSize: '0.85rem', marginTop: '8px' }}>{t('location.selected')} {selectedLabel}</p>}
    {message && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>{message}</p>}
    {results.length > 0 && <div style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
      {results.map(result => <button type="button" className="btn btn-secondary btn-sm" style={{ textAlign: 'left' }} key={`${result.latitude}-${result.longitude}`} onClick={() => {
        onChange({ type: 'Point', coordinates: [result.longitude, result.latitude], address: result.displayName, city: result.city });
        setQuery(result.displayName); setResults([]); setMessage(t('location.locationSelected'));
      }}>{result.displayName}</button>)}
    </div>}
  </div>;
}
