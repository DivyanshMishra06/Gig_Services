// Haversine distance calculation (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Matching score: 40% skill, 25% distance, 20% availability, 15% rating
function calculateMatchingScore(worker, query) {
  let score = 0;

  // Skill match (40%)
  const skillMatch = worker.skills.some(s =>
    s.toLowerCase().includes(query.skill?.toLowerCase() || '')
  );
  if (skillMatch) score += 40;
  else if (worker.primarySkill?.toLowerCase().includes(query.skill?.toLowerCase() || '')) score += 40;

  // Distance (25%) - closer is better, max 25km
  if (query.lat && query.lng) {
    const dist = haversineDistance(
      query.lat, query.lng,
      worker.location?.coordinates?.[1] || 0,
      worker.location?.coordinates?.[0] || 0
    );
    const distScore = Math.max(0, 25 * (1 - dist / 25));
    score += distScore;
    worker._distance = Math.round(dist * 10) / 10;
  } else {
    score += 12;
  }

  // Availability (20%)
  if (worker.availability === 'available') score += 20;
  else if (worker.availability === 'busy') score += 5;

  // Rating (15%)
  score += (worker.rating / 5) * 15;

  // Verification bonus
  if (worker.verificationStatus === 'verified') score += 5;

  worker._matchScore = Math.round(score * 10) / 10;
  return score;
}

module.exports = { haversineDistance, calculateMatchingScore };
