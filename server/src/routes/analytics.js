import express from 'express';
import AnalyticsService from '../services/analyticsService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/analytics/summary - Accessible to all authenticated users (students see stats)
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const { buildingId } = req.query;
    const summary = await AnalyticsService.getSummary(buildingId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/trends - Accessible to all authenticated users (students see stats)
router.get('/trends', requireAuth, async (req, res, next) => {
  try {
    const { range, buildingId } = req.query;
    const trends = await AnalyticsService.getTrends(range, buildingId);
    res.json(trends);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/buildings - Accessible to all authenticated users (students see stats)
router.get('/buildings', requireAuth, async (req, res, next) => {
  try {
    const usage = await AnalyticsService.getBuildingUsage();
    res.json(usage);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics/waste - Accessible to all authenticated users (students see stats)
router.get('/waste', requireAuth, async (req, res, next) => {
  try {
    const waste = await AnalyticsService.getWasteBreakdown();
    res.json(waste);
  } catch (err) {
    next(err);
  }
});

export default router;
