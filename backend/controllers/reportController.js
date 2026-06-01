const Report = require('../models/Report');
const SystemStats = require('../models/SystemStats');
const Alert = require('../models/Alert');
const SecurityLog = require('../models/SecurityLog');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const reportsDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { name, type, format, dateRange, sections } = req.body;
    const report = await Report.create({
      userId: req.user._id,
      name: name || `Report-${Date.now()}`,
      type: type || 'custom',
      format,
      dateRange,
      sections,
      status: 'generating'
    });

    // Async generation
    generateReportAsync(report, req.user).catch(console.error);

    res.status(201).json({ message: 'Report generation started', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate report generation.' });
  }
};

async function generateReportAsync(report, user) {
  try {
    const { dateRange } = report;
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);

    const [stats, alerts, securityLogs] = await Promise.all([
      SystemStats.find({ userId: user._id, timestamp: { $gte: from, $lte: to } })
        .select('cpu.usage memory.usagePercent timestamp').limit(5000),
      Alert.find({ userId: user._id, createdAt: { $gte: from, $lte: to } }).limit(500),
      SecurityLog.find({ userId: user._id, timestamp: { $gte: from, $lte: to } }).limit(500)
    ]);

    if (report.format === 'json') {
      const data = { report: report.toObject(), stats, alerts, securityLogs, generatedAt: new Date() };
      const filePath = path.join(reportsDir, `${report._id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      const fileSize = fs.statSync(filePath).size;
      await Report.findByIdAndUpdate(report._id, { status: 'completed', filePath, fileSize });

    } else if (report.format === 'csv') {
      let csv = 'Timestamp,CPU Usage,Memory Usage\n';
      stats.forEach(s => {
        csv += `${s.timestamp},${s.cpu.usage},${s.memory.usagePercent}\n`;
      });
      const filePath = path.join(reportsDir, `${report._id}.csv`);
      fs.writeFileSync(filePath, csv);
      const fileSize = fs.statSync(filePath).size;
      await Report.findByIdAndUpdate(report._id, { status: 'completed', filePath, fileSize });

    } else if (report.format === 'pdf') {
      const filePath = path.join(reportsDir, `${report._id}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24).fillColor('#00d4ff').text('SYSTEM SENTINEL', { align: 'center' });
      doc.fontSize(14).fillColor('#888').text('Performance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#333')
        .text(`Report: ${report.name}`)
        .text(`Period: ${from.toDateString()} - ${to.toDateString()}`)
        .text(`Generated: ${new Date().toLocaleString()}`);
      doc.moveDown();

      // Summary
      if (stats.length > 0) {
        const cpuVals = stats.map(s => s.cpu.usage).filter(Boolean);
        const memVals = stats.map(s => s.memory.usagePercent).filter(Boolean);
        doc.fontSize(16).fillColor('#00d4ff').text('Performance Summary');
        doc.fontSize(10).fillColor('#333')
          .text(`Average CPU: ${Math.round(cpuVals.reduce((a, b) => a + b, 0) / cpuVals.length || 0)}%`)
          .text(`Peak CPU: ${Math.max(...cpuVals, 0)}%`)
          .text(`Average Memory: ${Math.round(memVals.reduce((a, b) => a + b, 0) / memVals.length || 0)}%`)
          .text(`Peak Memory: ${Math.max(...memVals, 0)}%`)
          .text(`Data Points: ${stats.length}`);
        doc.moveDown();
      }

      // Alerts summary
      if (alerts.length > 0) {
        doc.fontSize(16).fillColor('#ff6b6b').text('Alerts Summary');
        const critical = alerts.filter(a => a.severity === 'critical').length;
        const warning = alerts.filter(a => a.severity === 'warning').length;
        doc.fontSize(10).fillColor('#333')
          .text(`Total Alerts: ${alerts.length}`)
          .text(`Critical: ${critical}`)
          .text(`Warning: ${warning}`)
          .text(`Info: ${alerts.length - critical - warning}`);
        doc.moveDown();

        doc.fontSize(12).fillColor('#333').text('Recent Alerts:');
        alerts.slice(0, 10).forEach(a => {
          doc.fontSize(9).text(`[${a.severity.toUpperCase()}] ${a.title} - ${new Date(a.createdAt).toLocaleString()}`);
        });
      }

      doc.end();
      await new Promise(resolve => writeStream.on('finish', resolve));
      const fileSize = fs.statSync(filePath).size;
      await Report.findByIdAndUpdate(report._id, { status: 'completed', filePath, fileSize });
    }
  } catch (error) {
    console.error('Report generation error:', error);
    await Report.findByIdAndUpdate(report._id, { status: 'failed' });
  }
}

exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    if (report.status !== 'completed') return res.status(400).json({ error: 'Report not ready yet.' });

    const filePath = report.filePath;
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Report file not found.' });

    res.download(filePath, `${report.name}.${report.format}`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download report.' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    if (report.filePath && fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report.' });
  }
};
