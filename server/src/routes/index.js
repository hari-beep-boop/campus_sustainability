import express from 'express';
import mongoose from 'mongoose';
import authRouter from './auth.js';
import buildingsRouter from './buildings.js';
import settingsRouter from './settings.js';
import analyticsRouter from './analytics.js';
import alertsRouter from './alerts.js';
import recommendationsRouter from './recommendations.js';
import forecastRouter from './forecast.js';
import devicesRouter from './devices.js';
import reportsRouter from './reports.js';
import aiRouter from './ai.js';
import ingestRouter from './ingest.js';
import streamRouter from './stream.js';

const router = express.Router();

// Liveness and readiness health check
router.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
  });
});

// Mount module routers
router.use('/auth', authRouter);
router.use('/buildings', buildingsRouter);
router.use('/settings', settingsRouter);
router.use('/analytics', analyticsRouter);
router.use('/alerts', alertsRouter);
router.use('/recommendations', recommendationsRouter);
router.use('/forecast', forecastRouter);
router.use('/devices', devicesRouter);
router.use('/reports', reportsRouter);
router.use('/ai', aiRouter);
router.use('/ingest', ingestRouter);
router.use('/stream', streamRouter);

export default router;
