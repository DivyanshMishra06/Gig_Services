const Worker = require('../models/Worker');
const User = require('../models/User');
const Service = require('../models/Service');
const { calculateMatchingScore, haversineDistance } = require('../services/matchingService');
const { validateCoordinates } = require('../services/locationService');

const MAX_RADIUS_KM = 100;

const workerSkillQuery = skill => !skill ? {} : ({
  $or: [
    { skills: { $regex: skill, $options: 'i' } },
    { primarySkill: { $regex: skill, $options: 'i' } }
  ]
});

const publicWorker = worker => {
  const result = worker.toObject ? worker.toObject() : worker;
  result.userName = result.userName || result.userId?.name;
  result.userAvatar = result.userAvatar || result.userId?.avatar;
  result.userEmail = result.userEmail || result.userId?.email;
  // Aggregation uses this temporary lookup only to derive public display data.
  // Do not return the linked user document (email/phone or other account data).
  delete result.user;
  delete result.distanceMeters;
  // A customer needs an approximate service area, not a worker's exact base coordinates.
  if (result.location) result.location = { city: result.location.city || '' };
  return result;
};

exports.getWorkers = async (req, res) => {
  try {
    const { skill, city, lat, lng, verified, availability, minRating, maxDistance, sort } = req.query;
    let query = {};

    if (skill) {
      query.$or = [
        { skills: { $regex: skill, $options: 'i' } },
        { primarySkill: { $regex: skill, $options: 'i' } }
      ];
    }
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (verified === 'true') query.verificationStatus = 'verified';
    if (availability) query.availability = availability;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    let workers = await Worker.find(query).populate('userId', 'name email phone avatar');

    // Calculate matching scores and distances
    workers = workers.map(w => {
      const workerObj = w.toObject();

      if (lat && lng) {
        calculateMatchingScore(workerObj, {
          skill: skill || '',
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        });
      }
      return publicWorker(workerObj);
    });

    // Filter by max distance
    if (maxDistance && lat && lng) {
      workers = workers.filter(w => (w._distance || 0) <= parseFloat(maxDistance));
    }

    // Sort
    if (lat && lng) {
      workers.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0));
    } else if (sort === 'rating') {
      workers.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'price') {
      workers.sort((a, b) => a.startingPrice - b.startingPrice);
    }

    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyWorkers = async (req, res) => {
  const coordinates = validateCoordinates(req.query.longitude, req.query.latitude);
  const radius = Number(req.query.radius ?? 10);
  if (!coordinates) return res.status(400).json({ message: 'Valid longitude and latitude are required.' });
  if (!Number.isFinite(radius) || radius <= 0 || radius > MAX_RADIUS_KM) {
    return res.status(400).json({ message: `Radius must be between 0 and ${MAX_RADIUS_KM} km.` });
  }

  try {
    let skills = req.query.skill ? [String(req.query.skill)] : [];
    if (req.query.category) {
      const categoryServices = await Service.find({
        isActive: true,
        category: { $regex: String(req.query.category), $options: 'i' }
      }).select('name');
      skills = skills.concat(categoryServices.map(service => service.name));
    }
    const uniqueSkills = [...new Set(skills.filter(Boolean))];
    const skillFilter = uniqueSkills.length ? {
      $or: uniqueSkills.flatMap(skill => [
        { skills: { $regex: skill, $options: 'i' } },
        { primarySkill: { $regex: skill, $options: 'i' } }
      ])
    } : {};

    const workers = await Worker.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude] },
          key: 'location',
          distanceField: 'distanceMeters',
          maxDistance: radius * 1000,
          spherical: true,
          query: { availability: { $ne: 'offline' }, verificationStatus: 'verified', ...skillFilter }
        }
      },
      // A worker whose own service area does not reach the customer is not a match.
      { $match: { $expr: { $lte: ['$distanceMeters', { $multiply: [{ $ifNull: ['$serviceArea', 10] }, 1000] }] } } },
      { $sort: { distanceMeters: 1, rating: -1 } },
      { $limit: 100 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      // Whitelist only fields needed by the customer search card. In particular,
      // do not expose a worker's base coordinates, contact, ID, banking, or welfare data.
      {
        $project: {
          skills: 1,
          primarySkill: 1,
          cooperativeName: 1,
          experience: 1,
          rating: 1,
          totalRatings: 1,
          completedJobs: 1,
          verificationStatus: 1,
          availability: 1,
          'location.city': 1,
          serviceArea: 1,
          startingPrice: 1,
          languages: 1,
          bio: 1,
          distanceMeters: 1,
          'user.name': 1,
          'user.avatar': 1
        }
      }
    ]);

    res.json(workers.map(worker => publicWorker({
      ...worker,
      userName: worker.user?.name,
      userAvatar: worker.user?.avatar,
      distance: Math.round((worker.distanceMeters / 1000) * 10) / 10
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('userId', 'name email phone avatar');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const workerObj = worker.toObject();
    workerObj.userName = workerObj.userId?.name;
    workerObj.userAvatar = workerObj.userId?.avatar;
    workerObj.userPhone = workerObj.userId?.phone;
    workerObj.userEmail = workerObj.userId?.email;

    // Calculate distance if customer coords provided
    if (req.query.lat && req.query.lng) {
      const dist = haversineDistance(
        parseFloat(req.query.lat), parseFloat(req.query.lng),
        worker.location?.coordinates?.[1] || 0,
        worker.location?.coordinates?.[0] || 0
      );
      workerObj._distance = Math.round(dist * 10) / 10;
    }

    res.json(publicWorker(workerObj));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found' });

    const fields = ['skills', 'primarySkill', 'experience', 'certifications', 'availability',
      'schedule', 'serviceArea', 'startingPrice', 'languages', 'bio', 'location',
      'emergencyContact', 'bankInfo'];

    if (req.body.location !== undefined && !isValidLocation(req.body.location)) {
      return res.status(400).json({ message: 'Location must include valid longitude and latitude coordinates.' });
    }
    if (req.body.serviceArea !== undefined && (!Number.isFinite(Number(req.body.serviceArea)) || Number(req.body.serviceArea) <= 0 || Number(req.body.serviceArea) > MAX_RADIUS_KM)) {
      return res.status(400).json({ message: `Service area must be between 0 and ${MAX_RADIUS_KM} km.` });
    }
    fields.forEach(f => {
      if (req.body[f] !== undefined) worker[f] = req.body[f];
    });

    const updated = await worker.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isValidLocation = location => location && location.type === 'Point' &&
  Array.isArray(location.coordinates) && Boolean(validateCoordinates(location.coordinates[0], location.coordinates[1]));

exports.updateAvailability = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    if (req.body.availability) worker.availability = req.body.availability;
    if (req.body.schedule) worker.schedule = req.body.schedule;

    const updated = await worker.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkerEarnings = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    // Generate earnings history for charts
    const earningsHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      earningsHistory.push({
        month: d.toLocaleString('default', { month: 'short' }),
        earnings: Math.round(15000 + Math.random() * 20000),
        jobs: Math.round(15 + Math.random() * 25)
      });
    }

    res.json({
      today: worker.earnings.today,
      weekly: worker.earnings.weekly,
      monthly: worker.earnings.monthly,
      total: worker.earnings.total,
      completedJobs: worker.completedJobs,
      history: earningsHistory,
      cooperativeContribution: Math.round(worker.earnings.monthly * 0.05),
      netEarnings: Math.round(worker.earnings.monthly * 0.95)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkerWelfare = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    res.json({
      ...worker.welfareStatus,
      workerContribution: 100,
      cooperativeContribution: 200,
      totalWelfareFund: 300,
      benefits: [
        { name: 'Health Insurance', status: worker.welfareStatus.insurance ? 'Active' : 'Pending', icon: '🏥' },
        { name: 'Accident Coverage', status: worker.welfareStatus.accidentCoverage ? 'Active' : 'Pending', icon: '🛡️' },
        { name: 'Training Programs', status: `${worker.welfareStatus.trainingCompleted} courses completed`, icon: '📚' },
        { name: 'Health Support', status: worker.welfareStatus.healthSupport ? 'Eligible' : 'Pending', icon: '❤️' },
        { name: 'Emergency Support', status: worker.welfareStatus.emergencySupport ? 'Available' : 'Not Active', icon: '🚨' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
