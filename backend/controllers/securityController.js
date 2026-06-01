const SecurityLog = require('../models/SecurityLog');

exports.getSecurityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;

    const logs = await SecurityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await SecurityLog.countDocuments(query);

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security logs.' });
  }
};

exports.clearLogs = async (req, res) => {
  try {
    await SecurityLog.deleteMany({ userId: req.user._id });
    res.json({ message: 'Security logs cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear security logs.' });
  }
};
