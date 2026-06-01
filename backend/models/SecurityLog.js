const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['login', 'logout', 'usb_connect', 'usb_disconnect', 'network_change', 'device_change', 'failed_login'],
    required: true
  },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  ip: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

securityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
