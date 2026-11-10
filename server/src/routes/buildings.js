import express from 'express';
import { z } from 'zod';
import Building from '../models/Building.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

const buildingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().optional(),
  location: z.string().optional(),
  campus: z.string().optional(),
  buildingType: z.enum(['academic', 'library', 'residential', 'administrative', 'laboratory', 'sports', 'other']).optional(),
  areaM2: z.number().positive().optional(),
  occupancy: z.number().int().positive().optional(),
});

// GET /api/v1/buildings - Accessible to any authenticated user (admin, manager, student)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const buildings = await Building.find().sort({ name: 1 });
    res.json({ buildings });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/buildings/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Building not found' },
      });
    }
    res.json({ building });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/buildings - Admin only
router.post('/', requireAuth, requireRole(['admin']), validate(buildingSchema), async (req, res, next) => {
  try {
    const building = await Building.create(req.body);
    res.status(201).json({ building });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/buildings/:id - Admin only
router.put('/:id', requireAuth, requireRole(['admin']), validate(buildingSchema.partial()), async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!building) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Building not found' },
      });
    }
    res.json({ building });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/buildings/:id - Admin only
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Building not found' },
      });
    }
    res.json({ message: 'Building deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
