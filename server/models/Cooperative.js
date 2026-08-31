const mongoose = require('mongoose');

const cooperativeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String },
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: [Number]
  },
  totalMembers: { type: Number, default: 0 },
  activeWorkers: { type: Number, default: 0 },
  services: [{ type: String }],
  rating: { type: Number, default: 0 },
  federationName: { type: String, default: '' },
  welfareFund: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cooperative', cooperativeSchema);
