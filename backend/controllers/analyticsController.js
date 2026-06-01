const SystemStats = require('../models/SystemStats');
const Alert = require('../models/Alert');

exports.getDailyStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const stats = await SystemStats.find({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 });

    if (stats.length === 0) {
      return res.json({ message: 'No data for this date', stats: [] });
    }

    const cpuValues = stats.map(s => s.cpu.usage).filter(v => v !== undefined);
    const memValues = stats.map(s => s.memory.usagePercent).filter(v => v !== undefined);

    const summary = {
      avgCpu: Math.round(cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length),
      peakCpu: Math.max(...cpuValues),
      avgMem: Math.round(memValues.reduce((a, b) => a + b, 0) / memValues.length),
      peakMem: Math.max(...memValues),
      dataPoints: stats.length,
      hourly: []
    };

    // Group by hour
    for (let h = 0; h < 24; h++) {
      const hourStats = stats.filter(s => new Date(s.timestamp).getHours() === h);
      if (hourStats.length > 0) {
        const hCpu = hourStats.map(s => s.cpu.usage).filter(v => v !== undefined);
        const hMem = hourStats.map(s => s.memory.usagePercent).filter(v => v !== undefined);
        summary.hourly.push({
          hour: h,
          avgCpu: hCpu.length ? Math.round(hCpu.reduce((a, b) => a + b, 0) / hCpu.length) : 0,
          avgMem: hMem.length ? Math.round(hMem.reduce((a, b) => a + b, 0) / hMem.length) : 0
        });
      }
    }

    res.json({ summary, stats: stats.slice(-200) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily stats.' });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const end = new Date();
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await SystemStats.find({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 });

    // Group by day
    const days = {};
    stats.forEach(s => {
      const day = new Date(s.timestamp).toDateString();
      if (!days[day]) days[day] = { cpu: [], mem: [], date: new Date(s.timestamp) };
      if (s.cpu.usage !== undefined) days[day].cpu.push(s.cpu.usage);
      if (s.memory.usagePercent !== undefined) days[day].mem.push(s.memory.usagePercent);
    });

    const weekly = Object.entries(days).map(([day, data]) => ({
      date: data.date,
      avgCpu: data.cpu.length ? Math.round(data.cpu.reduce((a, b) => a + b, 0) / data.cpu.length) : 0,
      peakCpu: data.cpu.length ? Math.max(...data.cpu) : 0,
      avgMem: data.mem.length ? Math.round(data.mem.reduce((a, b) => a + b, 0) / data.mem.length) : 0,
      peakMem: data.mem.length ? Math.max(...data.mem) : 0
    }));

    res.json({ weekly, totalDataPoints: stats.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly stats.' });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const end = new Date();
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = await SystemStats.find({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }).select('cpu.usage memory.usagePercent timestamp').sort({ timestamp: 1 });

    const days = {};
    stats.forEach(s => {
      const day = new Date(s.timestamp).toISOString().split('T')[0];
      if (!days[day]) days[day] = { cpu: [], mem: [] };
      if (s.cpu.usage !== undefined) days[day].cpu.push(s.cpu.usage);
      if (s.memory.usagePercent !== undefined) days[day].mem.push(s.memory.usagePercent);
    });

    const monthly = Object.entries(days).map(([date, data]) => ({
      date,
      avgCpu: data.cpu.length ? Math.round(data.cpu.reduce((a, b) => a + b, 0) / data.cpu.length) : 0,
      avgMem: data.mem.length ? Math.round(data.mem.reduce((a, b) => a + b, 0) / data.mem.length) : 0
    }));

    res.json({ monthly });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly stats.' });
  }
};

exports.getAlertStats = async (req, res) => {
  try {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [bySeverity, byType, recent] = await Promise.all([
      Alert.aggregate([
        { $match: { userId: req.user._id, createdAt: { $gte: last30 } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $match: { userId: req.user._id, createdAt: { $gte: last30 } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Alert.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10)
    ]);
    res.json({ bySeverity, byType, recent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert stats.' });
  }
};
