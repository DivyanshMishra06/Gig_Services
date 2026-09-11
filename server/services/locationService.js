const https = require('https');

const validateCoordinates = (longitude, latitude) => {
  const lng = Number(longitude);
  const lat = Number(latitude);
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return null;
  }
  return { longitude: lng, latitude: lat };
};

const getJson = (url, headers) => new Promise((resolve, reject) => {
  https.get(url, { headers }, response => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', chunk => { body += chunk; });
    response.on('end', () => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Geocoding provider returned ${response.statusCode}`));
      }
      try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid geocoding response')); }
    });
  }).on('error', reject);
});

const searchAddress = async query => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
  const results = await getJson(url, {
    // Nominatim requires an identifying User-Agent; deployments should configure a contact value.
    'User-Agent': process.env.GEOCODING_USER_AGENT || 'ActiveSetu/1.0 (location search)',
    Accept: 'application/json'
  });
  return results.map(result => ({
    displayName: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    city: result.address?.city || result.address?.town || result.address?.village || result.address?.county || ''
  })).filter(result => validateCoordinates(result.longitude, result.latitude));
};

module.exports = { validateCoordinates, searchAddress };
