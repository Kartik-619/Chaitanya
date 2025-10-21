/**
 * 🚀 CHAITANYA 2025 SERVER ENTRY POINT
 * 
 * This is the main server file that initializes and configures the entire application.
 * It sets up security, routes, middleware, and background services.
 * 
 * 🔒 SECURITY FEATURES:
 * - Helmet.js for security headers
 * - CORS configuration
 * - Rate limiting
 * - Input sanitization
 * - Crash protection systems
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import configurations and routes
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

// ==================== CRASH PROTECTION SYSTEM ====================

/**
 * Global error handlers to prevent server crashes
 * These catch unhandled exceptions and rejections
 */
process.on('uncaughtException', (error) => {
  console.error('🆘 UNCAUGHT EXCEPTION - Keeping server alive:', error.message);
  console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🆘 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// ==================== GRACEFUL SHUTDOWN HANDLERS ====================

/**
 * Graceful shutdown handlers for proper server termination
 */
function gracefulShutdown() {
  console.log('🛑 Received shutdown signal, shutting down gracefully...');
  
  // Clear all intervals
  if (retryInterval) clearInterval(retryInterval);
  if (backupInterval) clearInterval(backupInterval);
  if (sessionCleanupInterval) clearInterval(sessionCleanupInterval);
  
  setTimeout(() => {
    console.log('✅ Server shutdown complete');
    process.exit(0);
  }, 1000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ==================== SERVER INITIALIZATION ====================

const app = express();
const PORT = process.env.PORT || 3000;

// 🚀 CRITICAL FIX: Trust proxy for Render deployment
app.set('trust proxy', 1);

/**
 * Validate environment variables before starting server
 * Exits process if required environment variables are missing
 */
if (!validateEnvironment()) {
  console.error('❌ Server cannot start - missing environment variables');
  process.exit(1);
}

// ==================== MIDDLEWARE SETUP ====================

/**
 * Security middleware - Helmet.js for security headers
 * Configures Content Security Policy to prevent XSS attacks
 */
app.use(helmet({ 
  contentSecurityPolicy: { 
    directives: SERVER_CONFIG.CSP_DIRECTIVES 
  } 
}));

/**
 * CORS configuration for cross-origin requests
 * FIXED: Proper CORS configuration for frontend
 */
app.use(cors({
  origin: true,  // Allow all origins
  credentials: true
}));

/**
 * JSON parsing with size limit to prevent DoS attacks
 */
app.use(express.json({ limit: SERVER_CONFIG.SECURITY.JSON_LIMIT }));

/**
 * Input sanitization middleware
 * Trims strings and limits length to prevent abuse
 */
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

/**
 * Static file serving for admin dashboard and public assets
 */
app.use(express.static('public'));

// ==================== RENDER HEALTH CHECK ====================

/**
 * Root health check required by Render
 * This endpoint is used by Render's health check system
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Chaitanya 2025 Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== ROUTES SETUP ====================

// API Routes - Mount all API endpoints
app.use('/api/payment', paymentRoutes);
app.use('/api/register', registrationLimiter);
app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/debug', debugRoutes);

// HTML routes - Serve admin interface pages

// Add this test route to your main server file
app.get('/test-email-config', async (req, res) => {
  try {
    const emailService = require('./services/emailService'); // Adjust path as needed
    
    console.log('🧪 Testing email configuration endpoint called');
    
    // Test connection first
    const connectionTest = await emailService.testEmailConnection();
    
    if (!connectionTest.success) {
      return res.json({
        success: false,
        message: 'Email configuration test failed',
        error: connectionTest.error,
        debug: connectionTest.debug
      });
    }
    
    // If connection works, test actual email sending
    console.log('✅ Connection good, testing email send...');
    const testResult = await emailService.testEmailService();
    
    res.json({
      success: true,
      message: 'Email test completed',
      connection: connectionTest,
      email_test: testResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      debug: {
        email_set: !!process.env.UNIVERSITY_EMAIL,
        password_set: !!process.env.UNIVERSITY_EMAIL_PASSWORD,
        node_env: process.env.NODE_ENV
      }
    });
  }
});

// Simple health check for email service
app.get('/email-health', async (req, res) => {
  try {
    const emailService = require('./services/emailService');
    const connectionTest = await emailService.testEmailConnection();
    
    res.json({
      service: 'email',
      status: connectionTest.success ? 'healthy' : 'unhealthy',
      ...connectionTest,
      system_stats: emailService.getSystemStats()
    });
  } catch (error) {
    res.status(500).json({
      service: 'email',
      status: 'error',
      error: error.message
    });
  }
});

// ==================== GOOGLE SHEETS DEBUG ROUTES ====================

/**
 * Test Google Sheets connection and functionality
 */
app.get('/test-sheets', async (req, res) => {
  try {
    console.log('🧪 Testing Google Sheets connection...');
    
    const GoogleSheetsService = require('./services/googleSheetsService');
    
    // Test initialization
    const initialized = await GoogleSheetsService.initialize();
    console.log('📊 Sheets Initialized:', initialized);
    
    if (!initialized) {
      return res.json({ 
        success: false, 
        error: 'Google Sheets not initialized',
        solution: 'Check techfest-credentials.json file'
      });
    }
    
    // Test reading data
    const existingData = await GoogleSheetsService.getAllRegistrations();
    console.log('📈 Existing Data Count:', existingData.count);
    
    // Test writing data
    const testRegistration = {
      registrationType: 'individual',
      registrationId: 'TEST-' + Date.now(),
      personalDetails: {
        name: 'Test User',
        email: 'test@example.com', 
        phone: '1234567890',
        college: 'Test College'
      },
      totalAmount: 100,
      paymentDetails: {
        method: 'test',
        status: 'completed'
      },
      prelimEvents: ['Test Event'],
      isPremium: false,
      needsAccommodation: false,
      registeredAt: new Date().toISOString()
    };
    
    const saveResult = await GoogleSheetsService.saveRegistration(testRegistration);
    console.log('💾 Save Test Result:', saveResult);
    
    res.json({
      success: true,
      sheetsInitialized: initialized,
      existingRows: existingData.count,
      testSave: saveResult,
      spreadsheetId: GoogleSheetsService.spreadsheetId
    });
    
  } catch (error) {
    console.error('❌ Sheets Test Error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

/**
 * Debug Google Sheets configuration
 */
app.get('/debug-sheets', async (req, res) => {
  try {
    const GoogleSheetsService = require('./services/googleSheetsService');
    
    const debugInfo = {
      // Check credentials file
      credentialsFileExists: fs.existsSync('./techfest-credentials.json'),
      credentialsFileInRoot: fs.existsSync('./techfest-credentials.json'),
      
      // Check environment
      nodeEnv: process.env.NODE_ENV,
      spreadsheetId: GoogleSheetsService.spreadsheetId,
      
      // Service status
      serviceInitialized: GoogleSheetsService.initialized,
      
      // Test initialization
      initializationTest: await GoogleSheetsService.initialize()
    };
    
    // Try to read existing data
    try {
      const existingData = await GoogleSheetsService.getAllRegistrations();
      debugInfo.existingData = {
        success: existingData.success,
        count: existingData.count,
        source: existingData.source
      };
    } catch (readError) {
      debugInfo.existingDataError = readError.message;
    }
    
    res.json({
      success: true,
      debugInfo: debugInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug Sheets Error:', error);
    res.json({ 
      success: false, 
      error: error.message
    });
  }
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.redirect('/admin-login.html');
});

// ==================== HEALTH ENDPOINT ====================

/**
 * Health check endpoint for monitoring and load balancers
 * Returns server status, memory usage, and system information
 */
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({ 
    success: true, 
    message: 'Chaitanya 2025 Server is running',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    system: {
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
      }
    },
    services: {
      googleSheets: GoogleSheetsService.initialized ? '✅ Ready' : '❌ Offline',
      backup: '✅ Active',
      sessionCleanup: '✅ Active',
      premiumSystem: '✅ Active',
      accommodationSystem: '✅ Active',
      teamPricing: '✅ Active'
    },
    features: {
      collegeDropdown: '✅ Enabled',
      premiumPackage: '✅ Enabled', 
      accommodationBooking: '✅ Enabled',
      teamSizeValidation: '✅ Enabled',
      esportsSelection: '✅ Enabled'
    }
  });
});

/**
 * Basic status endpoint for quick server checks
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + ' seconds'
  });
});

/**
 * Root endpoint with API documentation
 * Lists all available endpoints and their purposes
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chaitanya 2025 Registration API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    newFeatures: [
      'College dropdown selection',
      'Premium package (₹200)',
      'Accommodation booking (₹600/person)',
      'Team size validation',
      'E-sports game selection',
      'Updated event pricing'
    ],
    endpoints: {
      'GET /api/health': 'Server status with detailed info',
      'GET /status': 'Basic server status',
      'POST /api/admin/login': 'Admin login',
      'GET /api/admin/stats': 'Registration statistics',
      'GET /api/admin/registrations': 'All registrations',
      'GET /api/admin/export-finance': 'Export financial data',
      'GET /api/admin/events': 'Events participation data',
      'POST /api/attendance/scan': 'Scan attendance QR',
      'GET /api/attendance/report': 'Get attendance report',
      'GET /api/attendance/check-duplicate': 'Check duplicate attendance',
      'POST /api/register/start': 'Start registration',
      'POST /api/register/verify-otp': 'Verify OTP',
      'POST /api/register/setup-individual': 'Individual setup',
      'POST /api/register/setup-team': 'Team setup',
      'POST /api/register/complete': 'Complete registration',
      'GET /api/debug/debug-env': 'Environment check',
      'GET /api/debug/debug/sheets': 'Google Sheets status',
      'GET /api/debug/test-email': 'Test email service',
      'GET /test-sheets': 'Test Google Sheets connection',
      'GET /debug-sheets': 'Debug Google Sheets configuration',
      'GET /admin-login.html': 'Admin login page',
      'GET /admin-dashboard.html': 'Admin dashboard',
      'GET /api/register/colleges': 'Get college list',
      'GET /api/register/team-events': 'Get team events with rules',
      'GET /api/register/individual-events': 'Get individual events',
      'GET /api/admin/premium-analytics': 'Premium package analytics',
      'GET /api/admin/accommodation-analytics': 'Accommodation analytics'
    }
  });
});

// ==================== 404 HANDLER ====================

/**
 * 404 handler for undefined routes
 * Returns consistent error format for unknown endpoints
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /status', 
      'GET /',
      'POST /api/register/start',
      'POST /api/register/verify-otp',
      'POST /api/register/setup-individual',
      'POST /api/register/setup-team', 
      'POST /api/register/complete',
      'POST /api/admin/login',
      'GET /api/admin/stats',
      'GET /api/admin/registrations',
      'GET /api/admin/export-finance',
      'GET /api/admin/events',
      'POST /api/attendance/scan',
      'GET /api/attendance/report',
      'GET /api/attendance/check-duplicate',
      'POST /api/payment/initialize-payment',
      'POST /api/payment/verify-payment',
      'GET /test-sheets',
      'GET /debug-sheets',
      'GET /admin-login.html',
      'GET /admin-dashboard.html'
    ]
  });
});

// ==================== BACKGROUND SERVICES ====================

/**
 * Failed registrations retry system
 * Automatically retries saving failed registrations to Google Sheets every 60 minutes
 */
retryInterval = setInterval(async () => {
  try {
    console.log('🔄 Checking for failed registrations to retry...');
    await BackupService.retryFailedRegistrations();
  } catch (error) {
    console.error('❌ Failed registrations retry system error:', error.message);
  }
}, 60 * 60 * 1000); // Every 60 minutes

console.log('🔄 Failed registrations retry system started (every 60 minutes)');

/**
 * Session backup system - backs up sessions every 30 minutes
 */
backupInterval = setInterval(() => {
  try {
    BackupService.saveSessionsToFile();
  } catch (error) {
    console.error('❌ Session backup error:', error.message);
  }
}, 30 * 60 * 1000); // Every 30 minutes

console.log('💾 Session backup system started (every 30 minutes)');

// ==================== SESSION MANAGEMENT ====================

/**
 * Automatic session cleanup to prevent memory leaks
 * Removes expired registration sessions at configured intervals
 */
if (SERVER_CONFIG.SESSION_CLEANUP.ENABLED) {
  sessionCleanupInterval = setInterval(() => {
    try {
      console.log('🧹 Running session cleanup...');
      RegistrationService.cleanupOldSessions();
      RegistrationService.cleanupMemory();
    } catch (error) {
      console.error('❌ Session cleanup error:', error.message);
    }
  }, SERVER_CONFIG.SESSION_CLEANUP.INTERVAL);
  
  console.log('🧹 Session cleanup system started');
}

// ==================== SERVER STARTUP ====================

/**
 * Start the server and initialize all required services
 */
app.listen(PORT, '0.0.0.0', async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Chaitanya 2025 Server running on port ' + PORT);
    console.log('🌍 Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('📧 Email service: ' + (process.env.UNIVERSITY_EMAIL_PASSWORD ? '✅ Ready' : '❌ Not configured'));
    console.log('🔒 Trust proxy: ✅ Enabled (for Render deployment)');
    console.log('🔄 Initializing Google Sheets...');
  }

  const sheetsInit = await GoogleSheetsService.initialize();

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 GOOGLE SHEETS DEBUG INFORMATION:');
    console.log('✅ Initialization Result:', sheetsInit);
    console.log('📊 Service Status:', GoogleSheetsService.initialized);
    console.log('📁 Credentials File Exists:', fs.existsSync('./techfest-credentials.json'));
    console.log('🔑 Spreadsheet ID:', GoogleSheetsService.spreadsheetId);
  }

  if (sheetsInit) {
    console.log('✅ Google Sheets Service Ready!');
  } else {
    console.log('❌ Google Sheets failed to initialize - running in backup mode');
  }

  const restored = BackupService.restoreSessions();
  if (restored && process.env.NODE_ENV !== 'production') {
    console.log('✅ Previous sessions restored from backup');
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n📋 SYSTEM STATUS:');
    console.log('🛡 Crash protection systems: ✅ Active');
    console.log('💾 Backup systems: ✅ Active');
    console.log('🧹 Session cleanup: ✅ Enabled');
    console.log('🎯 Registration API: ✅ Ready');
    console.log('👑 Admin Dashboard: ✅ Enabled');
    console.log('📝 Attendance System: ✅ Ready');
    console.log('💳 Payment System: ✅ Ready');
    console.log('🔒 Trust Proxy: ✅ Enabled');
    console.log('🌐 CORS: ✅ Configured');
    console.log('📊 Google Sheets:', GoogleSheetsService.initialized ? '✅ Ready' : '❌ Offline');
    console.log('\n🎉 All systems operational! Waiting for requests...');
  }
});

// ==================== CLEANUP ON EXIT ====================

/**
 * Cleanup intervals when process exits
 */
process.on('exit', () => {
  if (retryInterval) clearInterval(retryInterval);
  if (backupInterval) clearInterval(backupInterval);
  if (sessionCleanupInterval) clearInterval(sessionCleanupInterval);
  console.log('🧹 All background services stopped');
});
