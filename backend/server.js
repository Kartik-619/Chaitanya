/**
 * 🚀 CHAITANYA 2025 SERVER ENTRY POINT
 *
 * Main server file for initialization, routes, middleware, and background services.
 * Updated for Render deployment stability.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Configs & routes
const { SERVER_CONFIG } = require('./config/serverConfig');
const { validateEnvironment } = require('./config/envCheck');
const { registrationLimiter } = require('./middleware/rateLimit');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const attendanceRoutes = require('./routes/attendanceRoutes'); 
const debugRoutes = require('./routes/debugRoutes');
const GoogleSheetsService = require('./services/googleSheetsService');
const RegistrationService = require('./services/registrationService');
const paymentRoutes = require('./routes/paymentRoutes');
const BackupService = require('./services/backupService');
const emailService = require('./services/emailService');

// ==================== GLOBAL VARIABLES ====================
let sessionCleanupInterval;
let retryInterval;
let backupInterval;

// ==================== CRASH PROTECTION ====================
process.on('uncaughtException', (error) => {
  console.error('🆘 UNCAUGHT EXCEPTION - Keeping server alive:', error.message);
  console.error('Stack trace:', error.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🆘 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// ==================== SERVER INITIALIZATION ====================
const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

// Validate environment
if (!validateEnvironment()) {
  console.error('❌ Server cannot start - missing environment variables');
  process.exit(1);
}

// ==================== MIDDLEWARE ====================
app.use(helmet({ contentSecurityPolicy: { directives: SERVER_CONFIG.CSP_DIRECTIVES } }));

// Enhanced CORS configuration for Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development or specific domains in production
    const allowedOrigins = [
      'https://chaitanya-subdomain.vercel.app', // Replace with your actual Vercel domain
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      /\.vercel\.app$/  // Allow all Vercel preview deployments
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow but log for monitoring
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
};

app.use(cors(corsOptions));
app.use(express.json({ limit: SERVER_CONFIG.SECURITY.JSON_LIMIT }));
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim().substring(0, SERVER_CONFIG.SECURITY.TRIM_MAX_LENGTH);
      }
    });
  }
  next();
});
app.use(express.static('public'));

// ==================== ROUTES ====================
app.use('/api/payment', paymentRoutes);
app.use('/api/register', registrationLimiter);
app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/debug', debugRoutes);

// Health endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Chaitanya 2025 Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Other endpoints remain same
app.get('/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()) + ' seconds' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', path: req.originalUrl, method: req.method });
});

// ==================== BACKGROUND SERVICES ====================

// Failed registrations retry every 60 mins
retryInterval = setInterval(async () => {
  try {
    await BackupService.retryFailedRegistrations();
  } catch (error) {
    console.error('❌ Failed registrations retry system error:', error.message);
  }
}, 60 * 60 * 1000);

// Session backup every 30 mins
backupInterval = setInterval(() => {
  try {
    BackupService.saveSessionsToFile();
  } catch (error) {
    console.error('❌ Session backup error:', error.message);
  }
}, 30 * 60 * 1000);

// Session cleanup
if (SERVER_CONFIG.SESSION_CLEANUP.ENABLED) {
  sessionCleanupInterval = setInterval(() => {
    try {
      RegistrationService.cleanupOldSessions();
      RegistrationService.cleanupMemory();
    } catch (error) {
      console.error('❌ Session cleanup error:', error.message);
    }
  }, SERVER_CONFIG.SESSION_CLEANUP.INTERVAL);
}

// ==================== SERVER STARTUP ====================
async function startServer() {
  try {
    // CRITICAL: Start Express server FIRST to satisfy Render's port binding requirement
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('✅ Port bound successfully - Render health check will pass');
    });

    // Initialize services AFTER port is bound (non-blocking for Render)
    console.log('🔄 Initializing background services...');
    
    // Restore backup sessions (fast, synchronous)
    console.log('💾 Restoring backup sessions...');
    const restored = BackupService.restoreSessions();
    console.log(restored ? '✅ Previous sessions restored' : 'ℹ No previous sessions');

    // Initialize Google Sheets (slow, but non-blocking now)
    GoogleSheetsService.initialize()
      .then(sheetsInit => {
        console.log('📊 Google Sheets initialized:', sheetsInit);
        console.log('✅ Service Ready:', GoogleSheetsService.initialized);
      })
      .catch(error => {
        console.error('⚠️ Google Sheets initialization failed (non-critical):', error.message);
        console.log('ℹ Server will continue without Google Sheets integration');
      });

    console.log('🎉 All systems operational! Waiting for requests...');

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Start server
startServer();
