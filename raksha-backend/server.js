import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sosRoutes from './routes/sosRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev/hackathon environment
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach Socket.io to express app context to use in controllers
app.set('socketio', io);

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate Limiter to prevent spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'RAKSHA Command Center Backend API is operational',
    version: '1.0.0'
  });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`[SOCKET CONNECTED] Client ID: ${socket.id}`);

  // Event: Join unique room using sosId
  socket.on('join-sos-room', ({ sosId }) => {
    const roomName = `sos-${sosId}`;
    socket.join(roomName);
    console.log(`[SOCKET ROOM] Client ${socket.id} joined room: ${roomName}`);
  });

  // Event: User sends live location updates
  socket.on('send-location', ({ sosId, latitude, longitude, timestamp, accuracy, speed }) => {
    const roomName = `sos-${sosId}`;
    // Broadcast coordinates to everyone else in the room (emergency contacts, dashboard)
    socket.to(roomName).emit('receive-location', {
      sosId,
      latitude,
      longitude,
      timestamp: timestamp || new Date().toISOString(),
      accuracy: accuracy || null,
      speed: speed || null,
    });
    console.log(`[SOCKET LIVE UPDATE] Room: ${roomName} - Coordinates: [${latitude}, ${longitude}]`);
  });

  // Event: Disconnect
  socket.on('disconnect', () => {
    console.log(`[SOCKET DISCONNECTED] Client ID: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER RUNNING] Port: ${PORT}`);
});
