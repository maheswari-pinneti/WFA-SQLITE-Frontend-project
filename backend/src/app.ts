import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.routes.js';
import { initDb, healthCheck } from './config/db.js';
import { configureResilience, globalRateLimiter } from './middleware/resilience.js';
import logger from './config/logger.js';

const app = express();

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'test') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Apply Helmet, compression, request ID tracking, and logging
configureResilience(app);

// Apply Global Rate Limiting
app.use(globalRateLimiter);

// Liveness Health Check
app.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Readiness Health Check (checks if SQLite database connection is active)
app.get('/ready', async (req: Request, res: Response) => {
  try {
    const isHealthy = await healthCheck();
    if (isHealthy) {
      res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
    } else {
      throw new Error('Database ping query returned no results');
    }
  } catch (err: any) {
    logger.error('health.readiness.failed', 'Database connection not ready.', { error: err.message });
    res.status(503).json({ status: 'DOWN', reason: 'Database connection failed' });
  }
});

// Generic Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Register routers
app.use('/v1', apiRouter);
app.use('/api', apiRouter);

// Database initialization
if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    logger.info('database.initialization', 'Database initialized successfully.');
  }).catch((err: any) => {
    logger.error('database.initialization.failed', 'Failed to initialize database', { error: err.message });
  });
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('http.error', err.message || 'Internal Server Error', {
    requestId: (req as any).requestId || 'unknown',
    method: req.method,
    route: req.originalUrl,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

export { app };
