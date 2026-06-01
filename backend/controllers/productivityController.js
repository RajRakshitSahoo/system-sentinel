const ProductivityLog = require('../models/ProductivityLog');

exports.getProductivityStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await ProductivityLog.find({
      userId: req.user._id,
      date: { $gte: start }
    }).sort({ date: -1 });

    const totalActive = logs.reduce((sum, l) => sum + l.activeTime, 0);
    const totalIdle = logs.reduce((sum, l) => sum + l.idleTime, 0);

    const appUsage = {};
    logs.forEach(log => {
      log.applications.forEach(app => {
        if (!appUsage[app.name]) appUsage[app.name] = 0;
        appUsage[app.name] += app.duration;
      });
    });

    const topApps = Object.entries(appUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, duration]) => ({ name, duration }));

    res.json({ logs, totalActive, totalIdle, topApps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch productivity stats.' });
  }
};

exports.logProductivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log = await ProductivityLog.findOne({ userId: req.user._id, date: today });
    if (!log) {
      log = new ProductivityLog({ userId: req.user._id, date: today, ...req.body });
    } else {
      Object.assign(log, req.body);
    }
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log productivity.' });
  }
};
