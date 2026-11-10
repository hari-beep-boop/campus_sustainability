import pino from 'pino';
import config from '../config/env.js';

export const logger = pino({
  level: config.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
