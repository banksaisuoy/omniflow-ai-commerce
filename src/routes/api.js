import express from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';

const router = express.Router();

router.post('/recommendations', getRecommendations);

// Placeholder for other routes
router.get('/health', (req, res) => res.json({ status: 'ok' }));

export default router;