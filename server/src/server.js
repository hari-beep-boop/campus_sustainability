import mongoose from 'mongoose';
import config from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import logger from './utils/logger.js';

let server;

async function bootstrap() {
  logger.info(
    {
      env: config.NODE_ENV,
      port: config.PORT,
      logLevel: config.LOG_LEVEL,
      corsOrigin: config.CORS_ORIGIN,
    },
    'Starting Campus Sustainability Tracker API server...'
  );

  // Connect to MongoDB
  try {
    await connectDB();
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to connect to MongoDB during startup');
    if (config.NODE_ENV === 'production') {
      logger.fatal('Terminating process due to database connection failure in production');
      process.exit(1);
    }
    logger.warn('Running in development mode without an active MongoDB connection');
  }

  // Start HTTP server
  server = app.listen(config.PORT, () => {
    logger.info(
      {
        port: config.PORT,
        healthCheck: `http://localhost:${config.PORT}/api/v1/health`,
      },
      `Server successfully listening on port ${config.PORT}`
    );
  });

  // Graceful shutdown handler
  const handleShutdown = async (signal) => {
    logger.info({ signal }, `Received ${signal}. Starting graceful shutdown...`);

    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed. No longer accepting new connections.');

        try {
          if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close(false);
            logger.info('Mongoose database connection closed gracefully.');
          }
        } catch (dbErr) {
          logger.error({ err: dbErr.message }, 'Error closing Mongoose connection');
        }

        logger.info('Graceful shutdown completed successfully.');
        process.exit(0);
      });

      // Force termination if server does not close within 10 seconds
      setTimeout(() => {
        logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
        process.exit(1);
      }, 10000).unref();
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Fatal bootstrap error occurred');
  process.exit(1);
});
