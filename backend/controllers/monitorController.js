const si = require('systeminformation');
const SystemStats = require('../models/SystemStats');

exports.getCurrentStats = async (req, res) => {
  try {
    const [cpu, mem, disk, networkStats, battery, osInfo, cpuTemp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.battery(),
      si.osInfo(),
      si.cpuTemperature().catch(() => ({ main: null }))
    ]);

    const stats = {
      cpu: {
        usage: Math.round(cpu.currentLoad),
        user: Math.round(cpu.currentLoadUser),
        system: Math.round(cpu.currentLoadSystem),
        temperature: cpuTemp.main
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        active: mem.active,
        usagePercent: Math.round((mem.used / mem.total) * 100)
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        usePercent: Math.round(d.use),
        mount: d.mount
      })),
      network: networkStats[0] ? {
        rx_bytes: networkStats[0].rx_bytes,
        tx_bytes: networkStats[0].tx_bytes,
        rx_sec: Math.max(0, networkStats[0].rx_sec),
        tx_sec: Math.max(0, networkStats[0].tx_sec),
        interface: networkStats[0].iface
      } : {},
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        isCharging: battery.isCharging,
        timeRemaining: battery.timeRemaining
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        uptime: Math.floor(require('os').uptime())
      },
      timestamp: new Date()
    };

    res.json(stats);
  } catch (error) {
    console.error('getCurrentStats error:', error);
    res.status(500).json({ error: 'Failed to fetch system stats.' });
  }
};

exports.getCpuInfo = async (req, res) => {
  try {
    const [cpuInfo, cpuLoad, cpuTemp] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.cpuTemperature().catch(() => ({ main: null, cores: [] }))
    ]);
    res.json({
      model: cpuInfo.manufacturer + ' ' + cpuInfo.brand,
      cores: cpuInfo.cores,
      physicalCores: cpuInfo.physicalCores,
      threads: cpuInfo.processors,
      speed: cpuInfo.speed,
      speedMax: cpuInfo.speedMax,
      usage: Math.round(cpuLoad.currentLoad),
      coreLoads: cpuLoad.cpus.map(c => Math.round(c.load)),
      temperature: cpuTemp.main,
      coreTemps: cpuTemp.cores
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CPU info.' });
  }
};

exports.getMemoryInfo = async (req, res) => {
  try {
    const [mem, memLayout] = await Promise.all([si.mem(), si.memLayout()]);
    res.json({
      total: mem.total,
      used: mem.used,
      free: mem.free,
      active: mem.active,
      available: mem.available,
      swapTotal: mem.swaptotal,
      swapUsed: mem.swapused,
      usagePercent: Math.round((mem.used / mem.total) * 100),
      layout: memLayout.map(m => ({
        size: m.size,
        bank: m.bank,
        type: m.type,
        clockSpeed: m.clockSpeed,
        manufacturer: m.manufacturer
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memory info.' });
  }
};

exports.getProcesses = async (req, res) => {
  try {
    const procs = await si.processes();
    const processList = procs.list
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 100)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: Math.round(p.cpu * 10) / 10,
        mem: Math.round(p.mem * 10) / 10,
        memVsz: p.memVsz,
        memRss: p.memRss,
        state: p.state,
        started: p.started,
        command: p.command,
        user: p.user
      }));

    res.json({
      total: procs.all,
      running: procs.running,
      sleeping: procs.sleeping,
      processes: processList
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch processes.' });
  }
};

exports.getNetworkInfo = async (req, res) => {
  try {
    const [interfaces, stats, connections, defaultNet] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
      si.networkConnections(),
      si.networkInterfaceDefault()
    ]);
    res.json({
      defaultInterface: defaultNet,
      interfaces: interfaces.map(i => ({
        name: i.iface,
        ip4: i.ip4,
        ip6: i.ip6,
        mac: i.mac,
        type: i.type,
        speed: i.speed,
        operstate: i.operstate
      })),
      stats: stats.map(s => ({
        interface: s.iface,
        rx_bytes: s.rx_bytes,
        tx_bytes: s.tx_bytes,
        rx_sec: Math.max(0, s.rx_sec),
        tx_sec: Math.max(0, s.tx_sec),
        rx_errors: s.rx_errors,
        tx_errors: s.tx_errors
      })),
      connections: {
        total: connections.length,
        established: connections.filter(c => c.state === 'ESTABLISHED').length,
        listening: connections.filter(c => c.state === 'LISTEN').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network info.' });
  }
};

exports.getStorageInfo = async (req, res) => {
  try {
    const [fsSize, blockDevices, diskIO] = await Promise.all([
      si.fsSize(),
      si.blockDevices(),
      si.disksIO().catch(() => ({ rIO: 0, wIO: 0, rIO_sec: 0, wIO_sec: 0 }))
    ]);
    res.json({
      drives: fsSize.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        usePercent: Math.round(d.use),
        mount: d.mount
      })),
      blockDevices: blockDevices.map(d => ({
        name: d.name,
        type: d.type,
        size: d.size,
        vendor: d.vendor,
        model: d.model,
        removable: d.removable
      })),
      io: diskIO
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage info.' });
  }
};

exports.getBatteryInfo = async (req, res) => {
  try {
    const battery = await si.battery();
    res.json(battery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battery info.' });
  }
};

exports.getHardwareInfo = async (req, res) => {
  try {
    const [cpu, graphics, motherboard, cpuTemp] = await Promise.all([
      si.cpu(),
      si.graphics().catch(() => ({ controllers: [], displays: [] })),
      si.baseboard().catch(() => ({})),
      si.cpuTemperature().catch(() => ({ main: null }))
    ]);
    res.json({
      cpu: {
        model: cpu.manufacturer + ' ' + cpu.brand,
        socket: cpu.socket,
        cores: cpu.cores,
        speed: cpu.speed,
        temperature: cpuTemp.main
      },
      gpu: graphics.controllers.map(g => ({
        model: g.model,
        vendor: g.vendor,
        vram: g.vram,
        driverVersion: g.driverVersion
      })),
      motherboard: {
        manufacturer: motherboard.manufacturer,
        model: motherboard.model,
        version: motherboard.version
      },
      displays: graphics.displays.map(d => ({
        model: d.model,
        main: d.main,
        resolutionX: d.resolutionX,
        resolutionY: d.resolutionY,
        refreshRate: d.currentRefreshRate
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hardware info.' });
  }
};

exports.getSystemOverview = async (req, res) => {
  try {
    const [cpuInfo, osInfo, system, bios, uptime] = await Promise.all([
      si.cpu(),
      si.osInfo(),
      si.system().catch(() => ({})),
      si.bios().catch(() => ({})),
      Promise.resolve(Math.floor(require('os').uptime()))
    ]);
    res.json({
      cpu: {
        model: cpuInfo.manufacturer + ' ' + cpuInfo.brand,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        speed: cpuInfo.speed,
        speedMax: cpuInfo.speedMax
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        kernel: osInfo.kernel,
        codepage: osInfo.codepage
      },
      system: {
        manufacturer: system.manufacturer,
        model: system.model,
        version: system.version,
        serial: system.serial ? '****' + system.serial.slice(-4) : 'N/A'
      },
      bios: {
        vendor: bios.vendor,
        version: bios.version,
        releaseDate: bios.releaseDate
      },
      uptime
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system overview.' });
  }
};

exports.getStatsHistory = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const stats = await SystemStats.find({
      userId: req.user._id,
      timestamp: { $gte: since }
    }).select('cpu.usage memory.usagePercent network timestamp').sort({ timestamp: 1 }).limit(1440);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats history.' });
  }
};
