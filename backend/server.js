import app from './app.js';
import { init as initSocket } from './socket/socketManager.js';
import env from './config/env.js';
import sequelize from './config/database.js';

const PORT = env.PORT || 3000;

// Start server
const server = app.listen(PORT, async () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);

  // Check database
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Sync database models (alter: true will add new columns without dropping data)
    await sequelize.sync({ alter: true });
    console.log('Database synced');
  } catch (error) {
    console.log('Database error:', error.message);
  }

  // Init socket
  initSocket(server);
  console.log('Socket.io ready\n');
});

export default server;
