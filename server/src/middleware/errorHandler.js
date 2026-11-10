import { ZodError } from 'zod';
import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Central Express error handler middleware
 * Conforms to API contract: { error: { code, message, details? } }
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details;

  // Log error with pino
  logger.error(
    {
      err: {
        message: err.message,
        name: err.name,
        code: err.code,
        stack: err.stack,
      },
      req: {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
      },
    },
    `Request error: ${err.message}`
  );

  // Zod validation error
  if (err instanceof ZodError || err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = (err.errors || err.issues || []).map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : e.path,
      message: e.message,
      code: e.code,
    }));
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation failed';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // MongoDB duplicate key error (code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields.length > 0 ? fields.join(', ') : 'field';
    message = `Duplicate value entered for ${fieldName}`;
    details = err.keyValue;
  }
  // Known HTTP error with statusCode
  else if (err.statusCode || err.status) {
    statusCode = err.statusCode || err.status;
    code = err.code || 'BAD_REQUEST';
    message = err.message;
    if (err.details !== undefined) {
      details = err.details;
    }
  }
  // Unhandled / server errors
  else {
    statusCode = 500;
    code = 'INTERNAL_SERVER_ERROR';
    message = config.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : err.message;
  }

  const responseBody = {
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    responseBody.error.details = details;
  }

  // Do not leak stack traces in production
  if (config.NODE_ENV !== 'production' && statusCode === 500 && err.stack) {
    responseBody.error.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

export default errorHandler;
