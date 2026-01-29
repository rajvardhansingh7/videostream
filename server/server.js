/**
 * Video Streaming Platform - Server Entry Point
 * 
 * Features:
 * - Express.js REST API
 * - Socket.io for real-time events
 * - JWT Authentication with RBAC
 * - Video upload and streaming
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import configurations
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const adminRoutes = require('./routes/admin');

// Import services
const processingService = require('./services/processingService');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Connect to MongoDB
connectDB();

// CORS configuration - supports multiple origins for development and production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploaded videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Video Streaming API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Video Streaming Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            videos: '/api/videos',
            admin: '/api/admin',
            health: '/api/health'
        }
    });
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
    } catch (error) {
        return next(new Error('Invalid token'));
    }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room for targeted events
    socket.join(`user-${socket.userId}`);

    // Handle joining specific video rooms (for future features like live comments)
    socket.on('join_video', (videoId) => {
        socket.join(`video-${videoId}`);
        console.log(`User ${socket.userId} joined video room: ${videoId}`);
    });

    socket.on('leave_video', (videoId) => {
        socket.leave(`video-${videoId}`);
        console.log(`User ${socket.userId} left video room: ${videoId}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// Set Socket.io instance on processing service
processingService.setSocketIO(io);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Server Configuration
const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🎬 Video Streaming Platform Server                   ║
║                                                        ║
║   Server running on: http://localhost:${PORT}             ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(39)}║
║   Socket.io: Enabled                                   ║
║                                                        ║
║   API Endpoints:                                       ║
║   - POST /api/auth/register                            ║
║   - POST /api/auth/login                               ║
║   - GET  /api/videos                                   ║
║   - POST /api/videos/upload                            ║
║   - GET  /api/videos/stream/:id                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server gracefully
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

module.exports = { app, server, io };
