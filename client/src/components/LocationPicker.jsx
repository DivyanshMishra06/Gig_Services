import { useState } from 'react';
import { geocodeLocation } from '../services/api';

const roundCoordinate = value => Math.round(value * 10000) / 10000;

const geolocationError = error => {
  if (error.code === error.PERMISSION_DENIED) return 'Location permission was denied. Enter a location manually instead.';
  if (error.code === error.POSITION_UNAVAILABLE) return 'Your current location is unavailable. Enter a location manually instead.';
  if (error.code === error.TIMEOUT) return 'Location request timed out. Please try again or enter a location manually.';
  return 'Could not get your location. Enter a location manually instead.';
};

export default function LocationPicker({ value, onChange, actionLabel = 'Use my current location' }) {
  const [query, setQuery] = useState(value?.address || value?.city || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const useCurrentLocation = () => {
    setMessage('');
    if (!navigator.geolocation) return setMessage('This browser does not support location. Enter a location manually instead.');
    navigator.geolocation.getCurrentPosition(
      position => {
        onChange({ type: 'Point', coordinates: [roundCoordinate(position.coords.longitude), roundCoordinate(position.coords.latitude)], address: 'Approximate current location', city: '' });
        setResults([]);
        setMessage('Current location selected. Only an approximate location is used.');
      },
      error => setMessage(geolocationError(error)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const findLocation = async () => {
    if (query.trim().length < 3) return setMessage('Enter at least 3 characters to search for a location.');
    setLoading(true); setMessage('');
    try {
      const { data } = await geocodeLocation(query.trim());
      setResults(data || []);
      if (!data?.length) setMessage('No matching locations found. Try a fuller address or city.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not search for that location. Please try again.');
    } finally { setLoading(false); }
  };

  const selectedLabel = value?.coordinates?.length === 2 ? (value.address || value.city || 'Location selected') : '';
  return <div className="form-group" style={{ marginTop: '12px' }}>
    <label>Location</label>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 10px' }}>Used only to find nearby workers. Your precise device location is not saved by this search.</p>
    <button type="button" className="btn btn-secondary btn-sm" onClick={useCurrentLocation}>📍 {actionLabel}</button>
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
      <input aria-label="Enter location manually" value={query} onChange={event => setQuery(event.target.value)} placeholder="Enter area, city, or address" />
      <button type="button" className="btn btn-secondary btn-sm" disabled={loading} onClick={findLocation}>{loading ? 'Searching...' : 'Search'}</button>
    </div>
    {selectedLabel && <p style={{ color: 'var(--success, #198754)', fontSize: '0.85rem', marginTop: '8px' }}>Selected: {selectedLabel}</p>}
    {message && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>{message}</p>}
    {results.length > 0 && <div style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
      {results.map(result => <button type="button" className="btn btn-secondary btn-sm" style={{ textAlign: 'left' }} key={`${result.latitude}-${result.longitude}`} onClick={() => {
        onChange({ type: 'Point', coordinates: [result.longitude, result.latitude], address: result.displayName, city: result.city });
        setQuery(result.displayName); setResults([]); setMessage('Location selected.');
      }}>{result.displayName}</button>)}
    </div>}
  </div>;
}
