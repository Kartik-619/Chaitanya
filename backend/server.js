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
const adminRoutes = require('./routes/adminRoutes'); 
const attendanceRoutes = require('./routes/attendanceRoutes'); 
const debugRoutes = require('./routes/debugRoutes');
const GoogleSheetsService = require('./services/googleSheetsService');
const RegistrationService = require('./services/registrationService');
const paymentRoutes = require('./routes/paymentRoutes');
const BackupService = require('./services/backupService');

const app = express();
const PORT = process.env.PORT || 10000;

// 🚨 DEBUG: Trust proxy for Render
app.set('trust proxy', 1);
console.log('🔧 DEBUG: Trust proxy enabled');

// 🚨 DEBUG: Simple CORS to avoid blocking
app.use(cors({
  origin: true,
  credentials: true
}));
console.log('🔧 DEBUG: CORS set to allow all origins');

// Security middleware
app.use(helmet({ 
  contentSecurityPolicy: false // Disable for debugging
}));

app.use(express.json({ limit: '10mb' }));

// 🚨 DEBUG: Request logger - shows EVERY request
app.use((req, res, next) => {
  console.log('📍 INCOMING REQUEST:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']?.substring(0, 50),
    body: req.body ? 'Has body data' : 'No body'
  });
  next();
});

// Static files
app.use(express.static('public'));

// 🚨 DEBUG: Test route to check if server is reachable
app.get('/api/debug/test-server', (req, res) => {
  console.log('✅ DEBUG: Test route hit successfully');
  res.json({ 
    success: true, 
    message: 'Server is reachable!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 🚨 DEBUG: Test email configuration
app.get('/api/debug/test-email', async (req, res) => {
  try {
    console.log('🔧 DEBUG: Testing email configuration...');
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.UNIVERSITY_EMAIL,
        pass: process.env.UNIVERSITY_EMAIL_PASSWORD
      },
      connectionTimeout: 10000
    });

    console.log('🔧 DEBUG: Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ DEBUG: SMTP connection successful');

    console.log('🔧 DEBUG: Testing email sending...');
    await transporter.sendMail({
      from: process.env.UNIVERSITY_EMAIL,
      to: 'djdikshit1922@gmail.com',
      subject: 'DEBUG: Test Email from Server',
      text: 'This is a test email from your debug server'
    });

    console.log('✅ DEBUG: Email sent successfully');
    res.json({ 
      success: true, 
      message: 'Email test passed - check your inbox' 
    });
  } catch (error) {
    console.error('❌ DEBUG: Email test failed:', error.message);
    res.json({ 
      success: false, 
      error: error.message,
      step: 'Check if App Password is correct and 2FA is enabled'
    });
  }
});

// 🚨 DEBUG: Test registration endpoint directly
app.post('/api/debug/test-registration', async (req, res) => {
  try {
    console.log('🔧 DEBUG: Testing registration endpoint...');
    console.log('🔧 DEBUG: Request body:', req.body);

    // Simulate registration without email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`✅ DEBUG: OTP generated: ${otp}`);

    res.json({
      success: true,
      message: 'DEBUG: Registration test successful',
      otp: otp,
      sessionId: 'debug-session-' + Date.now(),
      note: 'This is a test - check server logs for OTP'
    });
  } catch (error) {
    console.error('❌ DEBUG: Registration test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Regular routes
app.use('/api/payment', paymentRoutes);
app.use('/api/register', registrationLimiter);
app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/debug', debugRoutes);

// Admin routes
app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.redirect('/admin-login.html');
});

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DEBUG Server is running',
    time: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chaitanya 2025 DEBUG Server',
    debugEndpoints: {
      'GET /api/debug/test-server': 'Test if server is reachable',
      'GET /api/debug/test-email': 'Test email configuration',
      'POST /api/debug/test-registration': 'Test registration without email'
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ DEBUG: 404 - Route not found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found - check server logs'
  });
});

// 🚨 DEBUG: Global error handler
app.use((error, req, res, next) => {
  console.error('❌ DEBUG: Global error caught:', error.message);
  console.error('❌ DEBUG: Error stack:', error.stack);
  res.status(500).json({
    success: false,
    message: 'DEBUG: Internal server error - check logs',
    error: error.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log('🚀 DEBUG Server started on port', PORT);
  console.log('🔧 DEBUG: Testing environment...');
  console.log('🔧 DEBUG: UNIVERSITY_EMAIL exists:', !!process.env.UNIVERSITY_EMAIL);
  console.log('🔧 DEBUG: UNIVERSITY_EMAIL_PASSWORD exists:', !!process.env.UNIVERSITY_EMAIL_PASSWORD);
  
  // Initialize services
  try {
    await GoogleSheetsService.initialize();
    console.log('✅ DEBUG: Google Sheets initialized');
  } catch (error) {
    console.error('❌ DEBUG: Google Sheets failed:', error.message);
  }
  
  console.log('🎯 DEBUG: Server ready for testing!');
  console.log('📋 Test these endpoints:');
  console.log('1. GET  /api/debug/test-server');
  console.log('2. GET  /api/debug/test-email');
  console.log('3. POST /api/debug/test-registration');
});
