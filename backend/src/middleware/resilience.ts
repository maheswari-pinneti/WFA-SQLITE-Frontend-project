import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import crypto from 'crypto';
import logger from '../config/logger.js';

// Request ID injector
export const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  
  // Log request arrival
  const startTime = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('http.request', `${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userId: req.user?.id || null,
      role: req.user?.role || null
    });
  });
  next();
};

// Global rate limiting to protect the SQLite database from concurrent spikes
const globalLimiterInstance = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5000, // Limit each IP to 5000 requests per minute to allow spikes of 250 concurrent users making multiple API calls
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('rate_limit.exceeded', `IP ${req.ip} exceeded global rate limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

export const globalRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return globalLimiterInstance(req, res, next);
};

// Tight rate limiting for authentication/login requests to prevent brute-force attacks
const authLimiterInstance = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 login requests per minute in production to allow large corporate spikes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('security.rate_limit.exceeded', `IP ${req.ip} exceeded auth login limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 1 minute.'
    });
  }
});

export const authRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return authLimiterInstance(req, res, next);
};

// Rate limiting for token refresh requests
const refreshLimiterInstance = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 refresh requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('security.rate_limit.exceeded', `IP ${req.ip} exceeded refresh limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many token refresh attempts. Please try again later.'
    });
  }
});

export const refreshRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return refreshLimiterInstance(req, res, next);
};

// Wire up security headers and response compression
export const configureResilience = (app) => {
  app.use(helmet());
  app.use(compression());
  app.use(requestIdMiddleware);
};
