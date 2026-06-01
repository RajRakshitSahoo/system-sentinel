const si = require('systeminformation');
const SystemStats = require('../models/SystemStats');
const Alert = require('../models/Alert');
const EventLog = require('../models/EventLog');

let monitoringInterval = null;
let saveInterval = null;
let io = null;
let lastNetworkStats = null;
let connectedUsers = new Map(); // userId -> socketId

const defaultThresholds = {
  cpu: 90,
  ram: 85,
  disk: 95,
  temperature: 80,
  battery: 20
};

async function collectSystemData() {
  try {
    const [cpuLoad, mem, disk, network, battery, cpuTemp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.battery().catch(() => ({ hasBattery: false, percent: 0, isCharging: false })),
      si.cpuTemperature().catch(() => ({ main: null }))
    ]);

    const netStats = network[0] || {};
    const rxSec = lastNetworkStats ? Math.max(0, (netStats.rx_bytes - lastNetworkStats.rx_bytes)) : 0;
    const txSec = lastNetworkStats ? Math.max(0, (netStats.tx_bytes - lastNetworkStats.tx_bytes)) : 0;
    lastNetworkStats = netStats;

    return {
      cpu: {
        usage: Math.round(cpuLoad.currentLoad),
        user: Math.round(cpuLoad.currentLoadUser),
        system: Math.round(cpuLoad.currentLoadSystem),
        temperature: cpuTemp.main,
        coreLoads: cpuLoad.cpus.map(c => Math.round(c.load))
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        active: mem.active,
        usagePercent: Math.round((mem.used / mem.total) * 100)
      },
      disk: disk.slice(0, 5).map(d => ({
        fs: String(d.fs || ''),
        size: d.size,
        used: d.used,
        available: d.available,
        usePercent: Math.round(d.use),
        mount: String(d.mount || '')
      })),
      network: {
        rx_bytes: netStats.rx_bytes || 0,
        tx_bytes: netStats.tx_bytes || 0,
        rx_sec: rxSec,
        tx_sec: txSec,
        interface: netStats.iface || 'unknown'
      },
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        isCharging: battery.isCharging,
        timeRemaining: (battery.timeRemaining && battery.timeRemaining > 0)
          ? battery.timeRemaining
          : (!battery.isCharging && battery.hasBattery && battery.percent > 0)
            ? Math.round(battery.percent * 2.4) // estimate: ~4h at 100%
            : null
      },
      timestamp: new Date()
    };
  } catch (err) {
    console.error('Data collection error:', err.message);
    return null;
  }
}

async function checkAlerts(data, userId, thresholds) {
  const t = { ...defaultThresholds, ...thresholds };
  const alerts = [];

  if (data.cpu.usage >= t.cpu) {
    alerts.push({
      userId,
      type: 'cpu',
      severity: data.cpu.usage >= 95 ? 'critical' : 'warning',
      title: 'High CPU Usage',
      message: `CPU usage is at ${data.cpu.usage}% (threshold: ${t.cpu}%)`,
      value: data.cpu.usage,
      threshold: t.cpu
    });
  }

  if (data.memory.usagePercent >= t.ram) {
    alerts.push({
      userId,
      type: 'memory',
      severity: data.memory.usagePercent >= 95 ? 'critical' : 'warning',
      title: 'High Memory Usage',
      message: `RAM usage is at ${data.memory.usagePercent}% (threshold: ${t.ram}%)`,
      value: data.memory.usagePercent,
      threshold: t.ram
    });
  }

  for (const drive of data.disk) {
    if (drive.usePercent >= t.disk) {
      alerts.push({
        userId,
        type: 'disk',
        severity: 'critical',
        title: 'Critical Disk Space',
        message: `Drive ${drive.mount} is ${drive.usePercent}% full`,
        value: drive.usePercent,
        threshold: t.disk
      });
    }
  }

  if (data.cpu.temperature && data.cpu.temperature >= t.temperature) {
    alerts.push({
      userId,
      type: 'temperature',
      severity: data.cpu.temperature >= 90 ? 'critical' : 'warning',
      title: 'High CPU Temperature',
      message: `CPU temperature is ${data.cpu.temperature}°C (threshold: ${t.temperature}°C)`,
      value: data.cpu.temperature,
      threshold: t.temperature
    });
  }

  if (data.battery.hasBattery && !data.battery.isCharging && data.battery.percent <= t.battery) {
    alerts.push({
      userId,
      type: 'battery',
      severity: data.battery.percent <= 10 ? 'critical' : 'warning',
      title: 'Low Battery',
      message: `Battery at ${data.battery.percent}% (threshold: ${t.battery}%)`,
      value: data.battery.percent,
      threshold: t.battery
    });
  }

  // Save and emit alerts (throttle - max 1 per type per 5 min)
  for (const alertData of alerts) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await Alert.findOne({
      userId,
      type: alertData.type,
      createdAt: { $gte: fiveMinAgo }
    });
    if (!existing) {
      const alert = await Alert.create(alertData);
      if (io) {
        io.to(`user:${userId}`).emit('alert', alert);
      }
    }
  }
}

let statsBuffer = new Map(); // userId -> [stats]

async function flushStatsToDb() {
  for (const [userId, statsArr] of statsBuffer.entries()) {
    if (statsArr.length === 0) continue;
    try {
      const latest = statsArr[statsArr.length - 1];
      await SystemStats.create({ userId, ...latest });
      statsBuffer.set(userId, []);
    } catch (e) {
      console.error('Stats save error:', e.message);
    }
  }
}

function startMonitoring(socketIo) {
  io = socketIo;

  // Main monitoring loop — every second
  monitoringInterval = setInterval(async () => {
    const data = await collectSystemData();
    if (!data) return;

    // Emit to all connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      io.to(`user:${userId}`).emit('systemStats', data);

      // Check alerts (async, don't await)
      checkAlerts(data, userId, {}).catch(() => {});

      // Buffer for DB save
      if (!statsBuffer.has(userId)) statsBuffer.set(userId, []);
      statsBuffer.get(userId).push(data);
    }
  }, 1000);

  // Save to DB every 60 seconds
  saveInterval = setInterval(flushStatsToDb, 60000);

  console.log('✅ System monitoring started');
}

function stopMonitoring() {
  if (monitoringInterval) clearInterval(monitoringInterval);
  if (saveInterval) clearInterval(saveInterval);
  console.log('⏹ System monitoring stopped');
}

function addUser(userId) {
  connectedUsers.set(userId, true);
}

function removeUser(userId) {
  connectedUsers.delete(userId);
}

module.exports = { startMonitoring, stopMonitoring, addUser, removeUser };
