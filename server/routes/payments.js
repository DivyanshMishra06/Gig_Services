const express = require('express');
const { createOrder } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, authorize('customer'), createOrder);

module.exports = router;
