const mongoose = require('mongoose');

// Stores a deduplicated, minimal audit trail for future gateway webhooks.
// Raw webhook payloads are intentionally not persisted here.
const paymentEventSchema = new mongoose.Schema({
  provider: { type: String, required: true, trim: true },
  eventId: { type: String, required: true, trim: true },
  eventType: { type: String, required: true, trim: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
  providerPaymentId: { type: String, trim: true },
  payloadHash: { type: String, trim: true },
  status: { type: String, enum: ['received', 'processed', 'ignored', 'failed'], default: 'received' },
  error: { type: String, trim: true },
  processedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

paymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('PaymentEvent', paymentEventSchema);
