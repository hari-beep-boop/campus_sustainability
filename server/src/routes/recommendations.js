import express from 'express';
import Recommendation from '../models/Recommendation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { buildingId } = req.query;
    const filter = {};
    if (buildingId) filter.buildingId = buildingId;

    const recommendations = await Recommendation.find(filter)
      .populate('buildingId', 'name code')
      .sort({ createdAt: -1 });

    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
});

export default router;
