const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'csv', 'json'],
    required: true
  },
  dateRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  sections: [{
    type: String,
    enum: ['system', 'performance', 'alerts', 'security', 'network', 'storage']
  }],
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  filePath: { type: String },
  fileSize: { type: Number },
  summary: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
