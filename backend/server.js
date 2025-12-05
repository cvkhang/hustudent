import app from './app.js';
import { env } from './config/env.js';
import { sequelize } from './models/index.js';
import socketManager from './socket/socketManager.js';

let server;

// Database connection with retry logic
const connectDatabase = async () => {
  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✓ Database connected successfully');

      // Sync models (use { force: false } in production)
      if (env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: false });
        console.log('✓ Database models synchronized');
      }

      return;
    } catch (err) {
      console.log(`⚠ Database connection attempt ${i + 1}/${maxRetries} failed`);
      console.error(`  Error: ${err.message}`);

      if (i === maxRetries - 1) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }

      console.log(`  Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    const host = env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    server = app.listen(env.PORT, host, () => {
      console.log('\nServer started successfully!');
      console.log(`   Server: http://${host}:${env.PORT}`);
      console.log(`   API: http://${host}:${env.PORT}/api`);
      console.log(`   API Docs: http://${host}:${env.PORT}/api-docs`);
      console.log(`   Environment: ${env.NODE_ENV}`);

      const hasSupabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY;
      console.log(`   Storage: ${hasSupabase ? 'Supabase Cloud' : 'Local'}`);

      // Initialize Socket.IO
      try {
        socketManager.init(server);
        console.log('    Socket.IO initialized');
      } catch (err) {
        console.error('    Socket.IO initialization failed:', err.message);
      }

      console.log('');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n Port ${env.PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('\n Server error:', error.message);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('\n Server failed to start:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} signal received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log(' HTTP server closed');

      try {
        await sequelize.close();
        console.log(' Database connection closed');
        console.log(' Server shut down successfully');
        process.exit(0);
      } catch (err) {
        console.error(' Error during shutdown:', err.message);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error(' Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
startServer();
