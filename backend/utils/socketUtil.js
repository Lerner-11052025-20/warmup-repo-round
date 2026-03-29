const { Server } = require('socket.io');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'].filter(Boolean),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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

    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 Client ${socket.id} joined personal room: user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const setIO = (serverIO) => {
  io = serverIO;
  console.log('✅ Socket.io pointer updated');
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const emitToCompany = (companyId, event, data) => {
  if (io) {
    io.to(`company_${companyId}`).emit(event, data);
    console.log(`📡 [SOCKET] Emitted ${event} to company_${companyId}`);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
    console.log(`📡 [SOCKET] Emitted ${event} to user_${userId}`);
  }
};

module.exports = { init, setIO, getIO, emitToCompany, emitToUser };
