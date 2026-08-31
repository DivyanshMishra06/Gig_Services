const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  invoiceNumber: { type: String, unique: true },
  customerName: String,
  workerName: String,
  serviceName: String,
  date: { type: Date, default: Date.now },
  labourCharge: { type: Number, default: 0 },
  materialCharge: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  cooperativeContribution: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentMethod: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

invoiceSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
