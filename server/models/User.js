const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'worker', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  savedAddresses: [{
    label: String,
    address: String,
    city: String,
    coordinates: [Number]
  }],
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
