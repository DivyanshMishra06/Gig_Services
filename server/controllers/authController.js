const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { validateCoordinates } = require('../services/locationService');

const isValidLocation = location => location && location.type === 'Point' &&
  Array.isArray(location.coordinates) && Boolean(validateCoordinates(location.coordinates[0], location.coordinates[1]));

const googleClient = new OAuth2Client();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (location !== undefined && !isValidLocation(location)) {
      return res.status(400).json({ message: 'Location must include valid longitude and latitude coordinates.' });
    }
    const user = await User.create({ name, email, password, phone, role: role || 'customer', location });

    // If registering as worker, create worker profile
    if (role === 'worker') {
      await Worker.create({
        userId: user._id,
        skills: req.body.skills || [],
        primarySkill: req.body.primarySkill || '',
        cooperativeName: req.body.cooperativeName || '',
        experience: req.body.experience || 0,
        languages: req.body.languages || ['Hindi', 'English'],
        location: user.location,
        startingPrice: req.body.startingPrice || 199,
        bio: req.body.bio || ''
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      let workerProfile = null;
      if (user.role === 'worker') {
        workerProfile = await Worker.findOne({ userId: user._id });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        language: user.language,
        workerProfile,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google sign-in is not configured on the server' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email could not be verified' });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        password: crypto.randomBytes(32).toString('hex'),
        avatar: payload.picture || ''
      });
    }

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ userId: user._id });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      location: user.location,
      language: user.language,
      workerProfile,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(401).json({ message: 'Google credential is invalid or expired' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ userId: user._id });
    }
    res.json({ ...user.toObject(), workerProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;
      if (req.body.location !== undefined) {
        if (!isValidLocation(req.body.location)) return res.status(400).json({ message: 'Location must include valid longitude and latitude coordinates.' });
        user.location = req.body.location;
      }
      user.language = req.body.language || user.language;
      user.savedAddresses = req.body.savedAddresses || user.savedAddresses;
      const updated = await user.save();
      res.json({ ...updated.toObject(), password: undefined });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
