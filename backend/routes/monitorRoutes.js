const express = require('express');
const {
  getCurrentStats, getCpuInfo, getMemoryInfo, getProcesses,
  getNetworkInfo, getStorageInfo, getBatteryInfo, getHardwareInfo,
  getSystemOverview, getStatsHistory
} = require('../controllers/monitorController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/stats', getCurrentStats);
router.get('/cpu', getCpuInfo);
router.get('/memory', getMemoryInfo);
router.get('/processes', getProcesses);
router.get('/network', getNetworkInfo);
router.get('/storage', getStorageInfo);
router.get('/battery', getBatteryInfo);
router.get('/hardware', getHardwareInfo);
router.get('/overview', getSystemOverview);
router.get('/history', getStatsHistory);

module.exports = router;
