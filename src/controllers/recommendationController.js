import { recommendationEngine } from '../services/recommendation-engine.js';

export const getRecommendations = async (req, res) => {
  try {
    const { userId, context } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const recs = await recommendationEngine.getRecommendations(userId, context || {});
    
    return res.status(200).json({ recommendations: recs });
  } catch (error) {
    console.error('Error in getRecommendations controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};