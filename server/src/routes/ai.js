import express from 'express';
import GeminiService from '../services/geminiService.js';
import AiPlan from '../models/AiPlan.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All AI Planner routes are restricted to administrative roles: admin & facility_manager
router.use(requireAuth);
router.use(requireRole(['admin', 'facility_manager']));

// GET /api/v1/ai/status - Check whether GEMINI_API_KEY is configured in .env
router.get('/status', async (req, res, next) => {
  try {
    const status = await GeminiService.checkStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/plan - Generate structured sustainability roadmap using server .env key
router.post('/plan', async (req, res, next) => {
  try {
    const { scope } = req.body;

    const planDoc = await GeminiService.generatePlan({
      userId: req.user.id,
      scope: scope || {},
    });

    res.status(201).json({ plan: planDoc });
  } catch (err) {
    res.status(err.status || 500).json({
      error: { code: 'AI_PLAN_ERROR', message: err.message || 'Failed to generate sustainability plan' },
    });
  }
});

// GET /api/v1/ai/plans - List past plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await AiPlan.find().populate('createdBy', 'username role').sort({ createdAt: -1 });
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/plans/:id
router.get('/plans/:id', async (req, res, next) => {
  try {
    const plan = await AiPlan.findById(req.params.id).populate('createdBy', 'username role');
    if (!plan) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Implementation plan not found' },
      });
    }
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

export default router;
