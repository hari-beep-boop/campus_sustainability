import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Device from '../models/Device.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

const registerDeviceSchema = z.object({
  deviceId: z.string().min(3),
  buildingId: z.string(),
  label: z.string().min(2),
  sensors: z.array(z.enum(['co2', 'electricity', 'water'])).default(['co2', 'electricity', 'water']),
  calibration: z
    .object({
      co2: z.object({ offsetPpm: z.number().default(0), scale: z.number().default(1.0) }).optional(),
      electricity: z
        .object({
          sensitivityMvPerA: z.number().default(100),
          zeroCurrentMv: z.number().default(2500),
          mainsVoltage: z.number().default(230),
          powerFactor: z.number().default(0.9),
        })
        .optional(),
      water: z.object({ pulsesPerLitre: z.number().default(450) }).optional(),
    })
    .optional(),
});

// GET /api/v1/devices - Admin and Manager can view, but admin modifies
router.get('/', requireAuth, requireRole(['admin', 'facility_manager']), async (req, res, next) => {
  try {
    const devices = await Device.find()
      .populate('buildingId', 'name code location')
      .select('-apiKeyHash')
      .sort({ createdAt: -1 });

    res.json({ devices });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/devices - Register new device (Admin only). Returns plaintext apiKey ONCE.
router.post('/', requireAuth, requireRole(['admin']), validate(registerDeviceSchema), async (req, res, next) => {
  try {
    const { deviceId, buildingId, label, sensors, calibration } = req.body;

    const existing = await Device.findOne({ deviceId });
    if (existing) {
      return res.status(409).json({
        error: { code: 'DEVICE_EXISTS', message: `Device with ID '${deviceId}' already exists.` },
      });
    }

    // Generate 32-byte secure random API key
    const rawApiKey = `cst_node_${crypto.randomBytes(24).toString('hex')}`;
    const salt = await bcrypt.genSalt(10);
    const apiKeyHash = await bcrypt.hash(rawApiKey, salt);

    const device = await Device.create({
      deviceId,
      buildingId,
      label,
      apiKeyHash,
      sensors: sensors || ['co2', 'electricity', 'water'],
      calibration: calibration || {},
      status: 'online',
    });

    res.status(201).json({
      message: 'Device registered successfully. Save the API key now — it cannot be viewed again!',
      apiKey: rawApiKey,
      device: {
        id: device._id,
        deviceId: device.deviceId,
        buildingId: device.buildingId,
        label: device.label,
        sensors: device.sensors,
        calibration: device.calibration,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/devices/:id/calibration - Update calibration (Admin only)
router.put('/:id/calibration', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const { calibration } = req.body;
    const device = await Device.findByIdAndUpdate(req.params.id, { calibration }, { new: true }).select(
      '-apiKeyHash'
    );

    if (!device) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    res.json({ message: 'Calibration updated successfully', device });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/devices/:id - Admin only
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    res.json({ message: 'Device removed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
