const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHi: { type: String },
  category: { type: String },
  description: { type: String },
  descriptionHi: { type: String },
  icon: { type: String },
  basePrice: { type: Number, default: 199 },
  popularity: { type: Number, default: 0 },
  isEmergency: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
