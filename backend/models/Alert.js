const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['cpu', 'memory', 'disk', 'temperature', 'battery', 'network', 'security'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  value: { type: Number },
  threshold: { type: Number },
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date },
  resolvedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, acknowledged: 1 });

module.exports = mongoose.model('Alert', alertSchema);
