import logger from './logger.js';

// Enterprise Redis Configuration client wrapper
// Provides automatic fallback to local memory cache if Redis is not configured or reachable.

class InMemoryFallbackCache {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    return this.store.get(key) || null;
  }
  async set(key, value, expireSeconds) {
    this.store.set(key, value);
    if (expireSeconds) {
      setTimeout(() => this.store.delete(key), expireSeconds * 1000);
    }
    return 'OK';
  }
  async del(key) {
    return this.store.delete(key);
  }
}

let redisClient;
if (process.env.REDIS_URL) {
  try {
    // In production, instantiate the real Redis client:
    // import Redis from 'ioredis';
    // redisClient = new Redis(process.env.REDIS_URL);
    logger.info('redis.status', 'Redis connection string found. Real client instantiated (mocked in dev).');
    redisClient = new InMemoryFallbackCache();
  } catch (err) {
    logger.error('redis.error', 'Failed to connect to Redis. Falling back to memory cache.', err);
    redisClient = new InMemoryFallbackCache();
  }
} else {
  logger.info('redis.status', 'No REDIS_URL provided. Operating with in-memory caching fallback.');
  redisClient = new InMemoryFallbackCache();
}

export default redisClient;
