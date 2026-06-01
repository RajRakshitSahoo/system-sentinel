const mongoose = require('mongoose');

const productivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  activeTime: { type: Number, default: 0 }, // seconds
  idleTime: { type: Number, default: 0 },   // seconds
  applications: [{
    name: String,
    duration: Number, // seconds
    category: String
  }],
  hourlyActivity: [{
    hour: Number,
    activeMinutes: Number
  }]
}, { timestamps: true });

productivityLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ProductivityLog', productivityLogSchema);
