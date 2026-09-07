const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName: { type: String },
  description: { type: String },
  address: {
    full: String,
    city: String,
    coordinates: [Number]
  },
  date: { type: Date },
  time: { type: String },
  status: {
    type: String,
    // awaiting_payment is reserved for the real gateway flow. Existing bookings
    // continue to use the current pending → completed lifecycle.
    enum: ['awaiting_payment', 'pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  // All payment-facing monetary values are integer paise. estimatedPrice and
  // actualPrice remain rupee display values for backwards-compatible screens.
  pricing: {
    baseAmount: { type: Number, min: 0 },
    amount: { type: Number, min: 0 },
    platformCommission: { type: Number, min: 0 },
    workerPayout: { type: Number, min: 0 },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    source: { type: String, enum: ['worker_starting_price', 'service_base_price'] },
    quotedAt: { type: Date }
  },
  amount: { type: Number, min: 0 },
  platformCommission: { type: Number, min: 0 },
  workerPayout: { type: Number, min: 0 },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  paymentStatus: {
    type: String,
    enum: ['not_started', 'pending', 'authorized', 'paid', 'failed', 'partially_refunded', 'refunded'],
    default: 'not_started'
  },
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'processing', 'partially_refunded', 'refunded', 'failed'],
    default: 'none'
  },
  latestPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  payoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout' },
  estimatedPrice: { type: Number },
  actualPrice: { type: Number },
  isEmergency: { type: Boolean, default: false },
  notes: { type: String },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  workerName: { type: String },
  customerName: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

bookingSchema.index({ customerId: 1, paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ workerId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
