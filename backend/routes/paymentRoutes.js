/**
 * 💳 UPI PAYMENT ROUTES
 * 
 * Same routes as Razorpay but for UPI payments
 * No changes needed in frontend URLs
 */

const express = require('express');
const router = express.Router();

// Import controller and middleware
const paymentController = require('../controllers/paymentController');
const SecurityMiddleware = require('../middleware/security');
const { paymentLimiter } = require('../middleware/rateLimit');

/**
 * 🧹 APPLY SECURITY MIDDLEWARE TO ALL PAYMENT ROUTES
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
 * Returns: UPI configuration
 */
router.get('/config', (req, res) => {
  res.json({
    key: 'upi_payment_system',
    method: 'upi',
    supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI']
  });
});

// ========================
// 💰 UPI PAYMENT PROCESSING
// ========================

/**
 * POST /payment/initialize-payment
 * 
 * Purpose: Create a new UPI payment request
 * Access: Public (with rate limiting)
 */
router.post('/initialize-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.initializePayment
);

/**
 * POST /payment/verify-payment
 * 
 * Purpose: Verify UPI payment completion automatically
 * Access: Public (with rate limiting)
 */
router.post('/verify-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.verifyPayment
);

// Export the router for use in main server file
module.exports = router;
