const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String }],
  primarySkill: { type: String },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
  cooperativeName: { type: String },
  experience: { type: Number, default: 0 },
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    verified: Boolean
  }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  governmentId: { type: String, default: '' },
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  schedule: {
    monday: { start: String, end: String, active: Boolean },
    tuesday: { start: String, end: String, active: Boolean },
    wednesday: { start: String, end: String, active: Boolean },
    thursday: { start: String, end: String, active: Boolean },
    friday: { start: String, end: String, active: Boolean },
    saturday: { start: String, end: String, active: Boolean },
    sunday: { start: String, end: String, active: Boolean }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    address: String,
    city: String
  },
  serviceArea: { type: Number, default: 10 },
  startingPrice: { type: Number, default: 199 },
  languages: [{ type: String }],
  emergencyContact: { name: String, phone: String, relation: String },
  bankInfo: { bankName: String, accountNumber: String, ifsc: String },
  welfareStatus: {
    insurance: { type: Boolean, default: false },
    accidentCoverage: { type: Boolean, default: false },
    trainingCompleted: { type: Number, default: 0 },
    healthSupport: { type: Boolean, default: false },
    emergencySupport: { type: Boolean, default: false },
    welfareContribution: { type: Number, default: 0 },
    cooperativeContribution: { type: Number, default: 0 }
  },
  earnings: {
    today: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

workerSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Worker', workerSchema);
