const { searchAddress } = require('../services/locationService');

exports.geocodeAddress = async (req, res) => {
  const query = String(req.query.query || '').trim();
  if (query.length < 3 || query.length > 200) {
    return res.status(400).json({ message: 'Enter a location between 3 and 200 characters.' });
  }
  try {
    const locations = await searchAddress(query);
    res.json(locations);
  } catch (error) {
    res.status(503).json({ message: 'Location search is temporarily unavailable. Please try again.' });
  }
};
