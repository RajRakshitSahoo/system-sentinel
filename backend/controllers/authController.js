const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password });
    await SecurityLog.create({
      userId: user._id,
      type: 'login',
      description: 'User account created',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await SecurityLog.create({
        userId: user._id,
        type: 'failed_login',
        description: 'Failed login attempt',
        severity: 'warning',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    await SecurityLog.create({
      userId: user._id,
      type: 'login',
      description: 'User logged in successfully',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.logout = async (req, res) => {
  try {
    await SecurityLog.create({
      userId: req.user._id,
      type: 'logout',
      description: 'User logged out',
      ip: req.ip
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
