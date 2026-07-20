const mongoose = require('mongoose');
 
const eventLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['system', 'network', 'storage', 'security', 'hardware', 'user'],
    required: true
  },
  event: { type: String, required: true },
  description: { type: String },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

eventLogSchema.index({ userId: 1, timestamp: -1 });
eventLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('EventLog', eventLogSchema);
