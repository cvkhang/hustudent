
import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

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

export const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://hustudent.id.vn',
        'https://www.hustudent.id.vn',
        'https://api.hustudent.id.vn'
      ].filter(Boolean),
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

      let token = null;

      // 1. Check Authorization Header (Bearer Token)
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      // 2. Check Cookies if no header token found
      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.token || cookies.accessToken;
      }

      // 3. Check Handshake Auth Object (Client-side explicit auth)
      if (!token && socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }


      if (!token) {
        return next(new Error('Authentication error: No token found'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.userId = decoded.userId;
      console.log(`[Socket Auth] User ${socket.userId} authenticated via ${token === socket.handshake.auth?.token ? 'Handshake' : 'Cookie/Header'}`);
      next();
    } catch (err) {
      console.error('[Socket Auth] Error:', err.message);
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
      console.log(`📢 [Socket] User ${socket.userId} joined room ${room}`);
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

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export default { init, getIO };
