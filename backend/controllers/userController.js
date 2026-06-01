const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Settings updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
};
