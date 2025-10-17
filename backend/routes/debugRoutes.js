/**
 * 🐛 DEBUG & TESTING ROUTES
 * 
 * This file contains debugging and testing endpoints for:
 * - Environment variable verification
 * - Google Sheets connectivity testing
 * - Email service functionality testing
 * 
 * 🚨 IMPORTANT: These routes are for DEVELOPMENT ONLY
 * Should be disabled or removed in production
 */

const express = require('express');
const router = express.Router();

// Import services for testing
const GoogleSheetsService = require('../services/googleSheetsService');
const EmailService = require('../services/emailService');

// ========================
// 🔧 ENVIRONMENT DEBUGGING
// ========================

/**
 * GET /debug/debug-env
 * 
 * Purpose: Check if environment variables are loaded correctly
 * Access: Public (development only)
 * 
 * Returns: Status of critical environment variables
 * Use Case: Debugging deployment issues
 */
router.get('/debug-env', (req, res) => {
  res.json({
    UNIVERSITY_EMAIL_PASSWORD: process.env.UNIVERSITY_EMAIL_PASSWORD ? '✅ LOADED' : '❌ MISSING',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
    PORT: process.env.PORT || 5000
  });
});

// ========================
// 📊 GOOGLE SHEETS DEBUGGING
// ========================

/**
 * GET /debug/debug/sheets
 * 
 * Purpose: Test Google Sheets connectivity and data access
 * Access: Public (development only)
 * 
 * Returns: Sheets service status and data count
 * Use Case: Verify Sheets integration is working
 */
router.get('/debug/sheets', async (req, res) => {
  try {
    const result = await GoogleSheetsService.getAllRegistrations();
    res.json({
      success: result.success,
      message: result.message,
      dataCount: result.data ? result.data.length : 0
    });
  } catch (error) {
    res.json({ success: false, message: 'Sheets service error' });
  }
});

// ========================
// 📧 EMAIL SERVICE DEBUGGING
// ========================

/**
 * GET /debug/test-email
 * 
 * Purpose: Test email service functionality
 * Access: Public (development only)
 * 
 * Returns: Email service status and test results
 * Use Case: Verify email sending capabilities
 */
router.get('/test-email', async (req, res) => {
  try {
    const result = await EmailService.testEmailService();
    res.json({
      success: result.success,
      message: result.message,
      email: result.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email test failed' });
  }
});

// Export the router for use in main server file
module.exports = router;