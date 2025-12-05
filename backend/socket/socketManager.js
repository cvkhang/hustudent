const socketIO = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const env = require('../config/env');

let io;

// Helper to parse cookies from header
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(function (cookie) {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

const init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:5173'],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });

  // Middleware for Authentication
  io.use((socket, next) => {
    try {
      // Allow bypass for dev if needed
      if (process.env.SKIP_AUTH === 'true') {
        socket.userId = '11111111-1111-1111-1111-111111111111';
        return next();
      }

      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token;

      if (!token) {
        return next(new Error('Authentication error: No token found'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join a room with their userId for easy targeting
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });

    // Chat Events
    socket.on('join_chat', (chatId) => {
      const room = `chat-${chatId}`;
      socket.join(room);
      console.log(`User ${socket.userId} joined room ${room}`);
    });

    socket.on('leave_chat', (chatId) => {
      const room = `chat-${chatId}`;
      socket.leave(room);
    });

    socket.on('typing', ({ chatId, recipientId }) => {
      // Emit to recipient (direct) or room (group)
      if (recipientId) {
        io.to(recipientId).emit('typing', { chatId, typerId: socket.userId });
      } else {
        socket.to(`chat-${chatId}`).emit('typing', { chatId, typerId: socket.userId });
      }
    });

    socket.on('stop_typing', ({ chatId, recipientId }) => {
      if (recipientId) {
        io.to(recipientId).emit('stop_typing', { chatId, typerId: socket.userId });
      } else {
        socket.to(`chat-${chatId}`).emit('stop_typing', { chatId, typerId: socket.userId });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { init, getIO };
