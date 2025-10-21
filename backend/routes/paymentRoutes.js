/**
 * 💳 UPI PAYMENT ROUTES
 * 
 * Handles UPI payment processing
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
 * Payment configuration
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
 * Create new UPI payment request
 */
router.post('/initialize-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.initializePayment
);

/**
 * POST /payment/verify-payment
 * Verify UPI payment completion
 */
router.post('/verify-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.verifyPayment
);

/**
 * GET /payment/status/:sessionId
 * Check payment status
 */
router.get('/status/:sessionId',
  SecurityMiddleware.validateSession,
  paymentController.getPaymentStatus
);

/**
 * GET /payment/health
 * Payment service health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'UPI Payment Gateway',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// ========================
// ❌ FIXED 404 HANDLER
// ========================

/**
 * Handle undefined payment routes
 * ✅ FIXED: Use proper Express syntax
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Payment endpoint not found',
    availableEndpoints: [
      'GET /api/payment/config',
      'GET /api/payment/health',
      'GET /api/payment/status/:sessionId',
      'POST /api/payment/initialize-payment',
      'POST /api/payment/verify-payment'
    ]
  });
});

// Export the router
module.exports = router;
