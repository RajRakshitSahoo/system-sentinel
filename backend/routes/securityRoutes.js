const express = require('express');
const { getSecurityLogs, clearLogs } = require('../controllers/securityController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/', getSecurityLogs);
router.delete('/', clearLogs);
module.exports = router;
