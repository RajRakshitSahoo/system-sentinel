// userRoutes.js
const express = require('express');
const { updateProfile, updateSettings, changePassword, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.put('/profile', updateProfile);
router.put('/settings', updateSettings);
router.put('/password', changePassword);
router.delete('/account', deleteAccount);
module.exports = router;
