const Worker = require('../models/Worker');
const User = require('../models/User');
const { calculateMatchingScore, haversineDistance } = require('../services/matchingService');

exports.getWorkers = async (req, res) => {
  try {
    const { skill, lat, lng, verified, availability, minRating, maxDistance, sort } = req.query;
    let query = {};

    if (skill) {
      query.$or = [
        { skills: { $regex: skill, $options: 'i' } },
        { primarySkill: { $regex: skill, $options: 'i' } }
      ];
    }
    if (verified === 'true') query.verificationStatus = 'verified';
    if (availability) query.availability = availability;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    let workers = await Worker.find(query).populate('userId', 'name email phone avatar');

    // Calculate matching scores and distances
    workers = workers.map(w => {
      const workerObj = w.toObject();
      workerObj.userName = workerObj.userId?.name;
      workerObj.userAvatar = workerObj.userId?.avatar;
      workerObj.userEmail = workerObj.userId?.email;

      if (lat && lng) {
        calculateMatchingScore(workerObj, {
          skill: skill || '',
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        });
      }
      return workerObj;
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

exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('userId', 'name email phone avatar location');
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

    res.json(workerObj);
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

    fields.forEach(f => {
      if (req.body[f] !== undefined) worker[f] = req.body[f];
    });

    const updated = await worker.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
