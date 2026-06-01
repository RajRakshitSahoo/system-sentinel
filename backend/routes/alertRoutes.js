// alertRoutes.js
const express = require('express');
const { getAlerts, acknowledgeAlert, acknowledgeAll, deleteAlert, clearAlerts } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/', getAlerts);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/acknowledge-all', acknowledgeAll);
router.delete('/:id', deleteAlert);
router.delete('/', clearAlerts);
module.exports = router;
