let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    console.log('✅ Socket.IO Initialized');

    io.on('connection', (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);
      
      socket.on('join_company', (companyId) => {
        socket.join(`company_${companyId}`);
        console.log(`🏢 Client ${socket.id} joined company room: company_${companyId}`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  emitToCompany: (companyId, event, data) => {
    if (io) {
      io.to(`company_${companyId}`).emit(event, data);
      console.log(`📡 Emitted ${event} to company_${companyId}`);
    }
  }
};
