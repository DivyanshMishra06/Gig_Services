const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');

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
      user.location = req.body.location || user.location;
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
