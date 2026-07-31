import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserBehavior } from '../src/models/userBehaviorModel.js';
import { recommendationEngine } from '../src/services/recommendation-engine.js';
import { RecommendationCache } from '../src/services/recommendation-cache.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_recommendations';

async function generateMockData() {
  console.log('Generating mock data...');
  const users = Array.from({ length: 50 }, (_, i) => `user_${i}`);
  const products = Array.from({ length: 20 }, (_, i) => `prod_${i}`);
  const interactions = ['view', 'click', 'add_to_cart', 'purchase', 'like'];

  const data = [];
  for (let i = 0; i < 500; i++) {
    data.push({
      userId: users[Math.floor(Math.random() * users.length)],
      productId: products[Math.floor(Math.random() * products.length)],
      interactionType: interactions[Math.floor(Math.random() * interactions.length)],
      sessionId: `sess_${Math.floor(Math.random() * 100)}`
    });
  }

  // Only insert if the database is empty or explicitly in test mode to prevent data loss
  const existingCount = await UserBehavior.countDocuments();
  if (existingCount === 0 || process.env.NODE_ENV === 'test') {
    await UserBehavior.insertMany(data);
    console.log(`Inserted ${data.length} mock interactions.`);
  } else {
    console.log(`Found ${existingCount} existing interactions. Skipping mock data generation.`);
  }
  return users.slice(0, 10); // Return top 10 users to warm up
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const topUsers = await generateMockData();

    console.log('Computing popular item matrix...');
    await recommendationEngine.getPopularRecommendations(100);
    
    console.log('Warming cache for top users...');
    await RecommendationCache.warmUp(
      topUsers, 
      (userId, context) => recommendationEngine.getRecommendations(userId, { pageType: context }),
      'homepage'
    );

    console.log('Training and cache warming complete!');
  } catch (error) {
    console.error('Error during training script:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();