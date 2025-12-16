import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express.js backend!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import groupsRoutes from './routes/groupRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { init as initSocket } from './socket/socketManager.js';

app.use('/api/groups', groupsRoutes);
app.use('/api/chats', chatRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initSocket(server);
});
