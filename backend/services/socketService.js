const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { addUser, removeUser } = require('./monitoringService');

function setupSocketHandlers(io) {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${userId}`);

    // Join user's private room
    socket.join(`user:${userId}`);
    addUser(userId);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
      removeUser(userId);
    });

    socket.on('ping', () => socket.emit('pong', { timestamp: Date.now() }));

    // Client requests specific data
    socket.on('requestStats', async () => {
      try {
        const si = require('systeminformation');
        const [cpu, mem] = await Promise.all([si.currentLoad(), si.mem()]);
        socket.emit('statsResponse', {
          cpu: Math.round(cpu.currentLoad),
          mem: Math.round((mem.used / mem.total) * 100)
        });
      } catch (e) {}
    });
  });

  console.log('✅ Socket.IO handlers configured');
}

module.exports = { setupSocketHandlers };
