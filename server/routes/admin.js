const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats, getAdminWorkers, verifyWorker, getAdminBookings,
  getCooperatives, getDemandForecast, getWorkforceAllocation,
  getNotifications, markNotificationRead
} = require('../controllers/adminController');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/workers', protect, authorize('admin'), getAdminWorkers);
router.put('/workers/:id/verify', protect, authorize('admin'), verifyWorker);
router.get('/bookings', protect, authorize('admin'), getAdminBookings);
router.get('/cooperatives', protect, authorize('admin'), getCooperatives);
router.get('/forecast', protect, authorize('admin'), getDemandForecast);
router.get('/allocation', protect, authorize('admin'), getWorkforceAllocation);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
