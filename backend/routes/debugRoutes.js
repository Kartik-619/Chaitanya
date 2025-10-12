const express = require('express');
const router = express.Router();
const GoogleSheetsService = require('../services/googleSheetsService');
const EmailService = require('../services/emailService');

// Environment debug
router.get('/debug-env', (req, res) => {
  res.json({
    UNIVERSITY_EMAIL_PASSWORD: process.env.UNIVERSITY_EMAIL_PASSWORD ? '✅ LOADED' : '❌ MISSING',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
    PORT: process.env.PORT || 5000
  });
});

// Sheets debug endpoints
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

// Email debug endpoint
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

module.exports = router;