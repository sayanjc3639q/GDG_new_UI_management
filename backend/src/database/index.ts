import mongoose from 'mongoose';
import { logger } from '../common/utils/logger';
import { env } from '../config/env';

/**
 * Database connection layer using Mongoose.
 */
export async function connectDatabase(): Promise<void> {
  const uri = env.MONGODB_URI || env.DATABASE_URL;

  if (!uri) {
    logger.warn('No MONGODB_URI or DATABASE_URL provided. Running without database connection.');
    return;
  }

  try {
    logger.info('Connecting to MongoDB database...');
    await mongoose.connect(uri);
    logger.info('✅ MongoDB connection established successfully.');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed cleanly.');
    }
  } catch (error) {
    logger.error('Error during MongoDB disconnect:', error);
  }
}
