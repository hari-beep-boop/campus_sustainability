import express from 'express';
import Alert from '../models/Alert.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/alerts - Restricted to admin and facility_manager (administrative role)
router.get('/', requireAuth, requireRole(['admin', 'facility_manager']), async (req, res, next) => {
  try {
    const { buildingId, severity } = req.query;
    const filter = {};
    if (buildingId) filter.buildingId = buildingId;
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .populate('buildingId', 'name code')
      .populate('ackBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/alerts/:id/ack - Acknowledge alert (admin & manager only)
router.patch('/:id/ack', requireAuth, requireRole(['admin', 'facility_manager']), async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        ackBy: req.user.id,
        ackAt: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Alert not found' },
      });
    }

    res.json({ message: 'Alert acknowledged', alert });
  } catch (err) {
    next(err);
  }
});

export default router;
