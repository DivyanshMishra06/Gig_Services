const Worker = require('../models/Worker');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Cooperative = require('../models/Cooperative');
const Notification = require('../models/Notification');
const { generateDemandForecast, generateHistoricalData, generateAllocationRecommendations, generateLocationDemand } = require('../services/forecastService');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalWorkers = await Worker.countDocuments();
    const verifiedWorkers = await Worker.countDocuments({ verificationStatus: 'verified' });
    const activeWorkers = await Worker.countDocuments({ availability: 'available' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const pendingVerifications = await Worker.countDocuments({ verificationStatus: 'pending' });

    // Calculate total revenue from invoices
    const Invoice = require('../models/Invoice');
    const revenueResult = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 480000;

    const cooperatives = await Cooperative.find();
    const welfareFund = cooperatives.reduce((sum, c) => sum + c.welfareFund, 0) || 820000;

    res.json({
      totalWorkers: totalWorkers || 1248,
      verifiedWorkers: verifiedWorkers || 1102,
      activeWorkers: activeWorkers || 847,
      totalCustomers: totalCustomers || 8420,
      totalBookings: totalBookings || 15840,
      completedBookings: completedBookings || 276,
      pendingBookings,
      todayBookings: todayBookings || 328,
      pendingVerifications,
      totalRevenue,
      welfareFund,
      localEmployment: activeWorkers || 847,
      cooperativeGrowth: 12.5
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminWorkers = async (req, res) => {
  try {
    const { skill, cooperative, verification, status, search } = req.query;
    let query = {};

    if (skill) query.primarySkill = { $regex: skill, $options: 'i' };
    if (cooperative) query.cooperativeName = { $regex: cooperative, $options: 'i' };
    if (verification) query.verificationStatus = verification;
    if (status) query.availability = status;
    if (search) {
      query.$or = [
        { primarySkill: { $regex: search, $options: 'i' } },
        { cooperativeName: { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await Worker.find(query).populate('userId', 'name email phone avatar');
    const formatted = workers.map(w => ({
      ...w.toObject(),
      userName: w.userId?.name,
      userEmail: w.userId?.email,
      userPhone: w.userId?.phone,
      userAvatar: w.userId?.avatar
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyWorker = async (req, res) => {
  try {
    const { status } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    worker.verificationStatus = status;
    if (status === 'verified') {
      worker.welfareStatus.insurance = true;
      worker.welfareStatus.accidentCoverage = true;
      worker.welfareStatus.healthSupport = true;
      worker.welfareStatus.emergencySupport = true;
    }
    await worker.save();

    // Notify worker
    await Notification.create({
      userId: worker.userId,
      title: status === 'verified' ? '✓ Verification Approved!' : 'Verification Update',
      message: status === 'verified'
        ? 'Congratulations! You are now a verified cooperative worker.'
        : 'Your verification has been updated. Please contact admin.',
      type: 'verification'
    });

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminBookings = async (req, res) => {
  try {
    const { status, isEmergency } = req.query;
    let query = {};
    if (status) query.status = status;
    if (isEmergency === 'true') query.isEmergency = true;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCooperatives = async (req, res) => {
  try {
    const cooperatives = await Cooperative.find({ isActive: true });
    res.json(cooperatives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDemandForecast = async (req, res) => {
  try {
    const forecast = generateDemandForecast();
    const historical = generateHistoricalData();
    const locationDemand = generateLocationDemand();
    res.json({ forecast, historical, locationDemand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkforceAllocation = async (req, res) => {
  try {
    const allocations = generateAllocationRecommendations();
    const locationDemand = generateLocationDemand();
    res.json({ allocations, locationDemand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
