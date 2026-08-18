import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { handleAttendanceEvents } from './attendance.socket.js';
import { handleNotificationEvents } from './notification.socket.js';
import { handleEmployeeEvents } from './employee.socket.js';
import { handleDashboardEvents } from './dashboard.socket.js';

const JWT_SECRET = env.JWT_SECRET;

export const initSockets = (io) => {
  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1] || socket.handshake.query?.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, 'User:', socket.user?.email);
    
    // Connection rate limiting: limit messages/events per second to prevent DOS
    let messageCount = 0;
    const limitInterval = 1000; // 1s
    const maxMessagesPerInterval = 20;
    
    const rateLimitTimer = setInterval(() => {
      messageCount = 0;
    }, limitInterval);
    
    // Wrap socket.on to filter duplicate events & apply rate limiting
    const originalOn = socket.on;
    const lastEvents = new Map(); // Event name -> timestamp
    
    socket.on = function (event, fn) {
      return originalOn.call(socket, event, async function (...args) {
        // Connection Rate Limiting
        messageCount++;
        if (messageCount > maxMessagesPerInterval) {
          console.warn(`Socket rate limit exceeded for socket: ${socket.id}`);
          socket.emit('error', { message: 'Too many requests. Rate limit exceeded.' });
          return;
        }
        
        // Duplicate event filtering (debounce/throttle within 50ms)
        const now = Date.now();
        const lastTime = lastEvents.get(event);
        if (lastTime && now - lastTime < 50) {
          // Ignore duplicate events sent within 50ms
          return;
        }
        lastEvents.set(event, now);
        
        // Channel / Room Subscription Protection & Scoping
        if (event === 'join-room') {
          const room = args[0];
          // Authorize room subscription: e.g. department/team scopes or user-specific scopes
          const isAuthorized = 
            socket.user?.role === 'ADMIN' || 
            socket.user?.role === 'HR' || 
            room === `dept:${socket.user?.department}` || 
            room === `team:${socket.user?.team}` || 
            room === `user:${socket.user?.id}`;
          
          if (!isAuthorized) {
            socket.emit('error', { message: `Access denied to room ${room}` });
            return;
          }
        }
        
        return fn.apply(this, args);
      });
    };

    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });
    
    // Register domain socket events
    handleAttendanceEvents(socket, io);
    handleNotificationEvents(socket, io);
    handleEmployeeEvents(socket, io);
    handleDashboardEvents(socket, io);
    
    socket.on('disconnect', () => {
      clearInterval(rateLimitTimer);
      console.log('Socket disconnected:', socket.id);
    });
  });
};

