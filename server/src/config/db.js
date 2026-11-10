import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';
import { seedInitialData } from '../services/seedService.js';

let mongoMemoryInstance = null;

// Setup connection event listeners
mongoose.connection.on('connected', () => {
  logger.info({ uri: mongoose.connection.client.s.url }, 'MongoDB connection established successfully');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err: err.message }, 'MongoDB connection error encountered');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected');
});

/**
 * Connect to MongoDB with fallback to MongoMemoryServer for effortless local dev
 * @param {number} retries - Number of connection attempts before failing or falling back
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB(retries = 2) {
  let connected = false;

  // 1. Try real MongoDB connection first
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(
        { attempt, totalAttempts: retries, uri: config.MONGODB_URI },
        `Connecting to MongoDB (attempt ${attempt}/${retries})...`
      );

      const conn = await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
      });

      connected = true;
      await seedInitialData();
      return conn;
    } catch (err) {
      logger.warn(
        { attempt, totalAttempts: retries, error: err.message },
        `MongoDB connection attempt ${attempt} failed`
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // 2. If real Mongo failed and not production, fallback to MongoMemoryServer
  if (!connected && config.NODE_ENV !== 'production') {
    try {
      logger.info('Starting embedded MongoMemoryServer for instant local development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryInstance.getUri();

      logger.info({ memoryUri }, 'Embedded MongoMemoryServer started.');
      const conn = await mongoose.connect(memoryUri);

      // Seed initial data immediately
      await seedInitialData();
      return conn;
    } catch (memErr) {
      logger.error({ err: memErr.message }, 'Failed to start MongoMemoryServer');
      throw memErr;
    }
  }

  throw new Error('Could not establish database connection');
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
  }
}

export default connectDB;
