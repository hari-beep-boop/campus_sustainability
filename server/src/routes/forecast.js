import express from 'express';
import ForecastService from '../services/forecastService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:buildingId', requireAuth, async (req, res, next) => {
  try {
    const { buildingId } = req.params;
    const { type = 'energy', horizon = '7d' } = req.query;
    const days = parseInt(horizon) || 7;

    const forecast = await ForecastService.generateForecast(buildingId, type, days);
    res.json(forecast);
  } catch (err) {
    next(err);
  }
});

export default router;
