/**
 * 💳 PAYMENT ROUTES
 * 
 * This file defines all routes for payment processing:
 * - Razorpay payment initialization
 * - Payment verification and confirmation
 * - Payment configuration for frontend
 * 
 * 🔒 SECURITY FEATURES:
 * - Payment rate limiting to prevent abuse
 * - Input sanitization on all endpoints
 * - Payment data validation
 * - Session validation for transaction tracking
 */

const express = require('express');
const router = express.Router();

// Import controller and middleware
const paymentController = require('../controllers/paymentController');
const SecurityMiddleware = require('../middleware/security');
const { paymentLimiter } = require('../middleware/rateLimit');

/**
 * 🧹 APPLY SECURITY MIDDLEWARE TO ALL PAYMENT ROUTES
 * 
 * Protects against:
 * - Malicious input injection
 * - Payment fraud attempts
 * - Session hijacking
 */
router.use(SecurityMiddleware.sanitizeInput);

// ========================
// 🔧 PAYMENT CONFIGURATION
// ========================

/**
 * GET /payment/config
 * 
 * Purpose: Provide payment configuration to frontend
 * Access: Public
 * 
 * Returns: Razorpay key for client-side payment initialization
 * Security: Only exposes public key, never secret key
 */
router.get('/config', (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID
  });
});

// ========================
// 💰 PAYMENT PROCESSING
// ========================

/**
 * POST /payment/initialize-payment
 * 
 * Purpose: Create a new payment order in Razorpay
 * Access: Public (with rate limiting)
 * Protection: Payment limiter, payment validation, session validation
 * 
 * Process:
 * - Validates payment amount and session
 * - Creates Razorpay order
 * - Returns order ID for frontend
 */
router.post('/initialize-payment', 
  paymentLimiter,                      // Prevent payment abuse
  SecurityMiddleware.validatePayment,  // Validate payment data
  SecurityMiddleware.validateSession,  // Verify session exists
  paymentController.initializePayment  // Create Razorpay order
);

/**
 * POST /payment/verify-payment
 * 
 * Purpose: Verify payment completion and capture funds
 * Access: Public (with rate limiting)
 * Protection: Payment limiter, payment validation, session validation
 * 
 * Process:
 * - Validates Razorpay payment signature
 * - Confirms payment capture
 * - Updates registration status
 * - Sends confirmation email
 */
router.post('/verify-payment', 
  paymentLimiter,                      // Prevent verification abuse
  SecurityMiddleware.validatePayment,  // Validate payment data
  SecurityMiddleware.validateSession,  // Verify session exists
  paymentController.verifyPayment      // Verify and capture payment
);

// Export the router for use in main server file
module.exports = router;
