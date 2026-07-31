import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class RecommendationCache {
  /**
   * Generates a unique cache key based on user and context
   * @param {string} userId - The user ID
   * @param {string} context - Context like 'homepage', 'product:123', 'cart'
   * @returns {string} The Redis key
   */
  static getKey(userId, context = 'default') {
    return `rec:${userId}:${context}`;
  }

  /**
   * Gets recommendations from cache
   * @param {string} userId - The user ID
   * @param {string} context - The context
   * @returns {Promise<Array|null>} Cached recommendations or null
   */
  static async get(userId, context = 'default') {
    try {
      const key = this.getKey(userId, context);
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis Cache GET error:', error);
      return null;
    }
  }

  /**
   * Sets recommendations in cache
   * @param {string} userId - The user ID
   * @param {string} context - The context
   * @param {Array} recommendations - The list of recommendations to cache
   * @param {number} expiryInSeconds - Cache expiration (default 1 hour)
   */
  static async set(userId, context, recommendations, expiryInSeconds = 3600) {
    try {
      const key = this.getKey(userId, context);
      await redis.setex(key, expiryInSeconds, JSON.stringify(recommendations));
    } catch (error) {
      console.error('Redis Cache SET error:', error);
    }
  }

  /**
   * Invalidates a user's recommendation cache
   * @param {string} userId - The user ID
   */
  static async invalidate(userId) {
    try {
      const keys = await redis.keys(`rec:${userId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis Cache Invalidate error:', error);
    }
  }

  /**
   * Pre-warms cache for a list of users
   * @param {Array<string>} userIds - List of user IDs
   * @param {Function} computeFn - Function to compute recommendations `async (userId, context) => [...]`
   * @param {string} context - The context to warm up
   */
  static async warmUp(userIds, computeFn, context = 'homepage') {
    console.log(`Warming up cache for ${userIds.length} users...`);
    const batchSize = 50;
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (userId) => {
        try {
          const recs = await computeFn(userId, context);
          await this.set(userId, context, recs);
        } catch (error) {
          console.error(`Failed to warm up cache for user ${userId}:`, error);
        }
      }));
    }
    console.log('Cache warm-up complete.');
  }
}