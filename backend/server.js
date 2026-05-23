require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const petRoutes = require('./routes/pet');

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ar-pet-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/pet', petRoutes);

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'AR Pet Backend API',
    version: '1.0.0',
    endpoints: {
      'POST /api/pet/create': 'Create a new pet (returns userId)',
      'GET /api/pet/:userId': 'Get pet status',
      'POST /api/pet/:userId/feed': 'Feed the pet (+15 hunger)',
      'POST /api/pet/:userId/happy': 'Send heart gesture (+10 happiness)',
      'POST /api/pet/:userId/intimate': 'Intimate interaction (+10 intimacy)',
      'POST /api/pet/:userId/pet': 'Pet the cat (+5 happiness, +5 intimacy)',
      'DELETE /api/pet/:userId': 'Delete a pet'
    },
    notes: {
      stats: 'All stats (hunger, happiness, intimacy) are clamped between 0 and 100',
      mood: 'Mood is automatically calculated based on stats',
      'mood rules': {
        hunger_0: 'Pet becomes sad when hunger reaches 0',
        happiness_20: 'Pet becomes sad when happiness < 20',
        happiness_80: 'Pet becomes happy when happiness > 80',
        intimacy_20: 'Pet becomes angry when intimacy < 20'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    hint: 'Visit /api for available endpoints'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    initDatabase();

    app.listen(PORT, () => {
      console.log('');
      console.log('🐱 AR Pet Backend Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
