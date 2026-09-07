const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBookingById, updateBookingStatus, getInvoice, payInvoice } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.get('/:bookingId/invoice', protect, getInvoice);
router.put('/invoice/:id/pay', protect, payInvoice);

module.exports = router;
