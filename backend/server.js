require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// Import configurations and routes
const { SERVER_CONFIG } = require('./config/serverConfig');
const { validateEnvironment } = require('./config/envCheck');
const { registrationLimiter } = require('./middleware/rateLimit');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ ADDED
const attendanceRoutes = require('./routes/attendanceRoutes'); // ✅ ADDED
const debugRoutes = require('./routes/debugRoutes');
const GoogleSheetsService = require('./services/googleSheetsService');
const RegistrationController = require('./controllers/registrationController');
const paymentRoutes = require('./routes/paymentRoutes');

// ==================== CRASH PROTECTION SYSTEM ====================

process.on('uncaughtException', (error) => {
  console.error('🆘 UNCAUGHT EXCEPTION - Keeping server alive:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🆘 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  console.log(`📊 Memory Usage: ${usedMB}MB`);
}, 30000);

// ==================== SERVER INITIALIZATION ====================

const app = express();
const PORT = SERVER_CONFIG.PORT;

if (!validateEnvironment()) {
  console.error('❌ Server cannot start - missing environment variables');
  process.exit(1);
}

// ==================== MIDDLEWARE SETUP ====================

app.use(helmet({ 
  contentSecurityPolicy: { 
    directives: SERVER_CONFIG.CSP_DIRECTIVES 
  } 
}));

app.use(cors({
  origin: SERVER_CONFIG.SECURITY.CORS_ORIGIN,
  credentials: true
}));

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

// ==================== ROUTES SETUP ====================

// API Routes
app.use('/api/payment', paymentRoutes);
app.use('/api/register', registrationLimiter);
app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes); // ✅ ADDED
app.use('/api/attendance', attendanceRoutes); // ✅ ADDED
app.use('/api/debug', debugRoutes);

// HTML routes
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
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
      }
    }
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chaitanya 2025 Registration API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      'GET /api/health': 'Server status',
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
      'GET /admin-login.html': 'Admin login page',
      'GET /admin-dashboard.html': 'Admin dashboard'
    }
  });
});

// ==================== SESSION MANAGEMENT ====================

// Session cleanup
if (SERVER_CONFIG.SESSION_CLEANUP.ENABLED) {
  setInterval(() => {
    RegistrationController.cleanupOldSessions();
  }, SERVER_CONFIG.SESSION_CLEANUP.INTERVAL);
}

// ==================== SERVER STARTUP ====================

app.listen(PORT, async () => {
  console.log(`🚀 Chaitanya 2025 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email service: ${process.env.UNIVERSITY_EMAIL_PASSWORD ? '✅ Ready' : '❌ Not configured'}`);
  
  console.log('🔄 Initializing Google Sheets...');
  const sheetsInit = await GoogleSheetsService.initialize();
  if (sheetsInit) {
    console.log('✅ Google Sheets Service Ready!');
  } else {
    console.log('❌ Google Sheets failed to initialize');
  }
  
  console.log('🛡️  Crash protection systems active');
  console.log('📊 Memory monitoring enabled');
  console.log('🎯 Team Registration API Ready!');
  console.log('👑 Admin Routes: ✅ Enabled');
  console.log('📝 Attendance Routes: ✅ Enabled');
});