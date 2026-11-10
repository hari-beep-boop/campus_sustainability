import express from 'express';
import { z } from 'zod';
import Setting from '../models/Setting.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

const thresholdsSchema = z.object({
  energy_kwh: z.number().positive(),
  water_litres: z.number().positive(),
  co2_ppm: z.number().positive(),
  waste_kg: z.number().positive(),
  gridEmissionFactorKgPerKwh: z.number().positive().optional(),
  reportCampusName: z.string().optional(),
});

// GET /api/v1/settings/thresholds
router.get('/thresholds', requireAuth, async (req, res, next) => {
  try {
    const thresholdsDoc = await Setting.findOne({ key: 'thresholds' });
    const emissionDoc = await Setting.findOne({ key: 'gridEmissionFactorKgPerKwh' });
    const campusDoc = await Setting.findOne({ key: 'reportCampusName' });

    res.json({
      thresholds: thresholdsDoc?.value || {
        energy_kwh: 6000,
        water_litres: 95000,
        co2_ppm: 1000,
        waste_kg: 500,
      },
      gridEmissionFactorKgPerKwh: emissionDoc?.value || 0.71,
      reportCampusName: campusDoc?.value || 'Greenwood Central Campus',
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/settings/thresholds - Admin only
router.put(
  '/thresholds',
  requireAuth,
  requireRole(['admin']),
  validate(thresholdsSchema.partial()),
  async (req, res, next) => {
    try {
      const {
        energy_kwh,
        water_litres,
        co2_ppm,
        waste_kg,
        gridEmissionFactorKgPerKwh,
        reportCampusName,
      } = req.body;

      // Update thresholds
      if (energy_kwh !== undefined || water_litres !== undefined || co2_ppm !== undefined || waste_kg !== undefined) {
        const current = (await Setting.findOne({ key: 'thresholds' }))?.value || {};
        const updatedThresholds = {
          ...current,
          ...(energy_kwh !== undefined && { energy_kwh }),
          ...(water_litres !== undefined && { water_litres }),
          ...(co2_ppm !== undefined && { co2_ppm }),
          ...(waste_kg !== undefined && { waste_kg }),
        };
        await Setting.findOneAndUpdate(
          { key: 'thresholds' },
          { value: updatedThresholds },
          { upsert: true, new: true }
        );
      }

      // Update emission factor
      if (gridEmissionFactorKgPerKwh !== undefined) {
        await Setting.findOneAndUpdate(
          { key: 'gridEmissionFactorKgPerKwh' },
          { value: gridEmissionFactorKgPerKwh },
          { upsert: true, new: true }
        );
      }

      // Update campus name
      if (reportCampusName !== undefined) {
        await Setting.findOneAndUpdate(
          { key: 'reportCampusName' },
          { value: reportCampusName },
          { upsert: true, new: true }
        );
      }

      const refreshed = await Setting.find({
        key: { $in: ['thresholds', 'gridEmissionFactorKgPerKwh', 'reportCampusName'] },
      });

      const resultMap = {};
      refreshed.forEach((s) => {
        resultMap[s.key] = s.value;
      });

      res.json({
        message: 'Settings updated successfully',
        thresholds: resultMap['thresholds'],
        gridEmissionFactorKgPerKwh: resultMap['gridEmissionFactorKgPerKwh'],
        reportCampusName: resultMap['reportCampusName'],
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
