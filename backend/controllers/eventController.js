const EventLog = require('../models/EventLog');

exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, severity } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (severity) query.severity = severity;

    const events = await EventLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await EventLog.countDocuments(query);

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await EventLog.create({ ...req.body, userId: req.user._id });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

exports.clearEvents = async (req, res) => {
  try {
    await EventLog.deleteMany({ userId: req.user._id });
    res.json({ message: 'Events cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear events.' });
  }
};
