import dns from 'dns';
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
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('querySrv') || errorMsg.includes('ECONNREFUSED')) {
      logger.warn('⚠️ Default DNS failed for MongoDB SRV record. Retrying with Google/Cloudflare public DNS (8.8.8.8, 1.1.1.1)...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        await mongoose.connect(uri);
        logger.info('✅ MongoDB connection established successfully (using fallback public DNS).');
        return;
      } catch (retryError) {
        logger.error('❌ Failed to connect to MongoDB after DNS fallback:', retryError);
      }
    } else {
      logger.error('❌ Failed to connect to MongoDB:', error);
    }
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

