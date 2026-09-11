const mongoose = require('mongoose');

// Payouts are created as records only. No bank transfer is initiated until a
// provider integration explicitly moves the record through these states.
const payoutSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  amount: { type: Number, required: true, min: 0 },
  platformCommission: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  status: {
    type: String,
    enum: ['pending_payment', 'pending_service', 'eligible', 'processing', 'paid', 'failed', 'reversed', 'cancelled'],
    default: 'pending_payment'
  },
  provider: { type: String, trim: true },
  providerAccountId: { type: String, trim: true },
  providerTransferId: { type: String, trim: true, unique: true, sparse: true },
  idempotencyKey: { type: String, trim: true, unique: true, sparse: true },
  eligibleAt: Date,
  paidAt: Date,
  failureCode: { type: String, trim: true },
  failureDescription: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

payoutSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payout', payoutSchema);
