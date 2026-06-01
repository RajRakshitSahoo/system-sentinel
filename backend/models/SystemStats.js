const mongoose = require('mongoose');

const systemStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cpu: {
    usage: { type: Number, default: 0 },
    model: String,
    cores: Number,
    threads: Number,
    speed: Number,
    temperature: Number
  },
  memory: {
    total: Number,
    used: Number,
    free: Number,
    usagePercent: Number
  },
  disk: [{
    fs: String,
    type: String,
    size: Number,
    used: Number,
    available: Number,
    usePercent: Number,
    mount: String
  }],
  network: {
    rx_bytes: Number,
    tx_bytes: Number,
    rx_sec: Number,
    tx_sec: Number,
    interface: String
  },
  battery: {
    hasBattery: Boolean,
    percent: Number,
    isCharging: Boolean,
    timeRemaining: Number
  },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: false });

systemStatsSchema.index({ userId: 1, timestamp: -1 });
systemStatsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

module.exports = mongoose.model('SystemStats', systemStatsSchema);
