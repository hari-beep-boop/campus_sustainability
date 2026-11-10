import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import mongoSanitize from 'express-mongo-sanitize';

import config from './config/env.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration from env
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Request logging with Pino HTTP, redacting sensitive API keys
app.use(
  pinoHttp({
    logger,
    redact: [
      'req.headers["x-gemini-key"]',
      'req.headers["x-device-key"]',
      'req.headers["X-Gemini-Key"]',
      'req.headers["X-Device-Key"]',
    ],
  })
);

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});
app.use(generalLimiter);

// Ingestion payload limit: 256KB
app.use('/api/v1/ingest', express.json({ limit: '256kb' }));

// General JSON payload limit: 1MB
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Prevent MongoDB operator injection
app.use(mongoSanitize());

// Mount API routes
app.use('/api/v1', routes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Central error handler (must be last middleware)
app.use(errorHandler);

export default app;
