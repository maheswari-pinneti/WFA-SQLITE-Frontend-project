import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { app } from './backend/src/app.js';
import { initSockets } from './backend/src/sockets/index.js';
import { getDb } from './backend/src/config/db.js';
import logger from './backend/src/config/logger.js';

const PORT = process.env.PORT || 5000;

let server;
let io;

if (process.env.NODE_ENV !== 'test') {
  server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  initSockets(io);

  server.listen(PORT, () => {
    logger.info('server.startup', `Backend API with Socket.io running on http://localhost:${PORT}`);
  });
} else {
  server = http.createServer(app);
}

// Graceful Shutdown Handler
const handleGracefulShutdown = (signal) => {
  logger.info('server.shutdown.initiated', `Received ${signal}. Starting graceful shutdown...`);
  
  const shutdownAll = async () => {
    try {
      if (io) {
        await new Promise((resolve) => io.close(resolve));
        logger.info('server.shutdown.sockets_closed', 'Socket.IO connections closed.');
      }
      const db = getDb();
      if (db) {
        db.close();
        logger.info('server.shutdown.db_closed', 'SQLite database connection closed.');
      }
      process.exit(0);
    } catch (err) {
      logger.error('server.shutdown.error', 'Error during graceful shutdown', { error: err.message });
      process.exit(1);
    }
  };

  if (server) {
    server.close(async () => {
      logger.info('server.shutdown.http_closed', 'Express HTTP server closed.');
      await shutdownAll();
    });
    
    // Force shutdown if connections do not close in 10s
    setTimeout(() => {
      logger.error('server.shutdown.forced', 'Forcing server shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export { app, server };
