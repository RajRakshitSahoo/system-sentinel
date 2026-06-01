const express = require('express');
const { getEvents, createEvent, clearEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/', getEvents);
router.post('/', createEvent);
router.delete('/', clearEvents);
module.exports = router;
