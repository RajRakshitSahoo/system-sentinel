const express = require('express');
const { getProductivityStats, logProductivity } = require('../controllers/productivityController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/', getProductivityStats);
router.post('/', logProductivity);
module.exports = router;
