// Rule-based demand forecasting service
// Structured for future ML model integration

function generateDemandForecast(bookingHistory) {
  const services = [
    { name: 'Plumbing', current: 26, baseGrowth: 18, icon: '🔧' },
    { name: 'Electrical', current: 22, baseGrowth: 12, icon: '⚡' },
    { name: 'AC Repair', current: 18, baseGrowth: 32, icon: '❄️' },
    { name: 'Cleaning', current: 35, baseGrowth: 8, icon: '🧹' },
    { name: 'Carpentry', current: 15, baseGrowth: -5, icon: '🪚' },
    { name: 'Painting', current: 12, baseGrowth: 15, icon: '🎨' },
    { name: 'Appliance Repair', current: 20, baseGrowth: 22, icon: '🔌' },
    { name: 'Caregiver', current: 10, baseGrowth: 10, icon: '🏥' },
    { name: 'Driver', current: 14, baseGrowth: 6, icon: '🚗' },
    { name: 'Gardening', current: 8, baseGrowth: -2, icon: '🌿' }
  ];

  // Seasonal adjustment based on month
  const month = new Date().getMonth();
  const seasonalFactors = getSeasonalFactors(month);

  const forecasts = services.map(service => {
    const seasonMod = seasonalFactors[service.name] || 1;
    const randomVariation = (Math.random() - 0.5) * 10;
    const growthPercent = Math.round((service.baseGrowth * seasonMod) + randomVariation);
    const expectedDemand = Math.round(service.current * (1 + growthPercent / 100));

    return {
      service: service.name,
      icon: service.icon,
      currentWorkers: service.current,
      expectedDemand: Math.max(expectedDemand, 1),
      growthPercent,
      trend: growthPercent > 0 ? 'up' : growthPercent < 0 ? 'down' : 'stable',
      confidence: Math.round(70 + Math.random() * 25),
      recommended: Math.max(0, expectedDemand - service.current)
    };
  });

  return forecasts;
}

function getSeasonalFactors(month) {
  // Summer months (April-June): AC repair increases
  if (month >= 3 && month <= 5) {
    return { 'AC Repair': 2.0, 'Plumbing': 1.2, 'Electrical': 1.1, 'Cleaning': 1.3 };
  }
  // Monsoon (July-Sept): Plumbing, electrical increase
  if (month >= 6 && month <= 8) {
    return { 'Plumbing': 1.5, 'Electrical': 1.4, 'AC Repair': 0.8, 'Painting': 0.5 };
  }
  // Winter (Nov-Jan): Heater/electrical
  if (month >= 10 || month <= 0) {
    return { 'Electrical': 1.3, 'AC Repair': 0.3, 'Plumbing': 1.1, 'Caregiver': 1.4 };
  }
  return {};
}

function generateHistoricalData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const services = ['Plumbing', 'Electrical', 'AC Repair', 'Cleaning', 'Carpentry'];

  return months.map((month, i) => {
    const entry = { month };
    services.forEach(service => {
      const base = 50 + Math.random() * 100;
      const seasonal = getSeasonalFactors(i)[service] || 1;
      entry[service] = Math.round(base * seasonal);
    });
    return entry;
  });
}

function generateAllocationRecommendations() {
  const areas = [
    {
      area: 'Bareilly Central',
      services: [
        { service: 'AC Repair', available: 4, required: 9, shortage: 5, urgency: 'high' },
        { service: 'Plumbing', available: 6, required: 8, shortage: 2, urgency: 'medium' }
      ]
    },
    {
      area: 'Civil Lines',
      services: [
        { service: 'Electrical', available: 3, required: 7, shortage: 4, urgency: 'high' },
        { service: 'Cleaning', available: 5, required: 6, shortage: 1, urgency: 'low' }
      ]
    },
    {
      area: 'Satellite Township',
      services: [
        { service: 'Plumbing', available: 2, required: 5, shortage: 3, urgency: 'high' },
        { service: 'Carpentry', available: 4, required: 4, shortage: 0, urgency: 'none' }
      ]
    },
    {
      area: 'Lucknow Gomti Nagar',
      services: [
        { service: 'AC Repair', available: 5, required: 12, shortage: 7, urgency: 'critical' },
        { service: 'Appliance Repair', available: 3, required: 6, shortage: 3, urgency: 'high' }
      ]
    },
    {
      area: 'Cantt Area',
      services: [
        { service: 'Electrical', available: 8, required: 6, shortage: 0, urgency: 'none' },
        { service: 'Painting', available: 2, required: 4, shortage: 2, urgency: 'medium' }
      ]
    }
  ];

  return areas.map(area => ({
    ...area,
    recommendation: area.services
      .filter(s => s.shortage > 0)
      .map(s => `Move ${s.shortage} ${s.service} workers from nearby surplus areas`)
  }));
}

function generateLocationDemand() {
  return [
    { location: 'Bareilly Central', lat: 28.367, lng: 79.432, demand: 85, workers: 42 },
    { location: 'Civil Lines', lat: 28.370, lng: 79.415, demand: 62, workers: 28 },
    { location: 'Satellite Township', lat: 28.355, lng: 79.445, demand: 45, workers: 22 },
    { location: 'Cantt Area', lat: 28.380, lng: 79.410, demand: 38, workers: 35 },
    { location: 'Izzatnagar', lat: 28.350, lng: 79.390, demand: 52, workers: 18 },
    { location: 'Lucknow Gomti Nagar', lat: 26.856, lng: 80.996, demand: 95, workers: 55 },
    { location: 'Delhi Saket', lat: 28.524, lng: 77.218, demand: 120, workers: 78 },
    { location: 'Kanpur Civil Lines', lat: 26.463, lng: 80.330, demand: 68, workers: 30 }
  ];
}

module.exports = {
  generateDemandForecast,
  generateHistoricalData,
  generateAllocationRecommendations,
  generateLocationDemand
};
