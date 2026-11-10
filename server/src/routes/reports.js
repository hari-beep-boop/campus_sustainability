import express from 'express';
import ReportService from '../services/reportService.js';
import Report from '../models/Report.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/reports/download - Download generated PDF (Admin & Manager only)
router.get('/download', requireAuth, requireRole(['admin', 'facility_manager']), async (req, res, next) => {
  try {
    const { campus } = req.query;
    await ReportService.generateCampusPdf(res, campus);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reports - List past generated reports (Admin & Manager only)
router.get('/', requireAuth, requireRole(['admin', 'facility_manager']), async (req, res, next) => {
  try {
    const reports = await Report.find().populate('generatedBy', 'username role').sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

export default router;
