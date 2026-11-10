import express from 'express';
import bcrypt from 'bcryptjs';
import Device from '../models/Device.js';
import Reading from '../models/Reading.js';
import CalcService from '../services/calcService.js';
import { broadcastLiveUpdate } from './stream.js';

const router = express.Router();

// Device authentication middleware
async function deviceAuth(req, res, next) {
  const deviceKey = req.headers['x-device-key'];
  const { deviceId } = req.body;

  if (!deviceId || !deviceKey) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED_DEVICE', message: 'Missing deviceId or X-Device-Key header' },
    });
  }

  const device = await Device.findOne({ deviceId });
  if (!device) {
    return res.status(404).json({
      error: { code: 'DEVICE_NOT_FOUND', message: `Device '${deviceId}' is not registered` },
    });
  }

  const validKey = await bcrypt.compare(deviceKey, device.apiKeyHash);
  if (!validKey) {
    return res.status(401).json({
      error: { code: 'INVALID_DEVICE_KEY', message: 'Invalid device credentials' },
    });
  }

  req.device = device;
  next();
}

// POST /api/v1/ingest
router.post('/', deviceAuth, async (req, res, next) => {
  try {
    const { deviceId, seq, samples } = req.body;
    const device = req.device;

    if (!Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({
        error: { code: 'EMPTY_BATCH', message: 'Payload must contain non-empty samples array' },
      });
    }

    // Check for sequence idempotency
    if (seq !== undefined) {
      const existing = await Reading.findOne({
        'meta.deviceId': deviceId,
        'meta.seq': seq,
      });
      if (existing) {
        return res.status(202).json({
          accepted: 0,
          duplicates: samples.length,
          rejected: [],
          message: 'Batch already processed (idempotency key matched)',
        });
      }
    }

    const readingsToInsert = [];
    const latestValues = {};

    for (const sample of samples) {
      const sampleTs = sample.ts ? new Date(sample.ts) : new Date();
      const derived = CalcService.processSample(sample, device.calibration);

      for (const item of derived) {
        readingsToInsert.push({
          ts: sampleTs,
          meta: {
            buildingId: device.buildingId,
            deviceId: device.deviceId,
            type: item.type,
            seq,
          },
          value: item.value,
          unit: item.unit,
          raw: item.raw,
        });

        latestValues[item.type] = item.value;
      }
    }

    if (readingsToInsert.length > 0) {
      await Reading.insertMany(readingsToInsert);
    }

    // Update device status & lastSeenAt
    device.status = 'online';
    device.lastSeenAt = new Date();
    await device.save();

    // Broadcast to connected SSE dashboards
    broadcastLiveUpdate({
      deviceId: device.deviceId,
      buildingId: device.buildingId,
      ts: new Date(),
      latestValues,
    });

    res.status(202).json({
      accepted: readingsToInsert.length,
      duplicates: 0,
      rejected: [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
