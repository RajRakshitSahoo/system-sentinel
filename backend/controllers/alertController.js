const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 50, severity, acknowledged, type } = req.query;
    const query = { userId: req.user._id };
    if (severity) query.severity = severity;
    if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';
    if (type) query.type = type;

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({ userId: req.user._id, acknowledged: false });

    res.json({ alerts, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json({ message: 'Alert acknowledged', alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert.' });
  }
};

exports.acknowledgeAll = async (req, res) => {
  try {
    await Alert.updateMany(
      { userId: req.user._id, acknowledged: false },
      { acknowledged: true, acknowledgedAt: new Date() }
    );
    res.json({ message: 'All alerts acknowledged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alerts.' });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert.' });
  }
};

exports.clearAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({ userId: req.user._id });
    res.json({ message: 'All alerts cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear alerts.' });
  }
};
