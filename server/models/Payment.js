const mongoose = require('mongoose');

// One document per payment attempt. Gateway-specific creation and verification
// will be added later; this model deliberately does not simulate either.
const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, trim: true },
  providerOrderId: { type: String, trim: true, unique: true, sparse: true },
  receipt: { type: String, trim: true, unique: true, sparse: true },
  providerPaymentId: { type: String, trim: true, unique: true, sparse: true },
  idempotencyKey: { type: String, trim: true, unique: true, sparse: true },
  amount: { type: Number, required: true, min: 0 },
  amountRefunded: { type: Number, default: 0, min: 0 },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'pending', 'authorized', 'captured', 'failed', 'partially_refunded', 'refunded'],
    default: 'created'
  },
  paymentMethod: { type: String, trim: true },
  failureCode: { type: String, trim: true },
  failureDescription: { type: String, trim: true },
  capturedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

paymentSchema.index({ bookingId: 1, createdAt: -1 });
paymentSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
