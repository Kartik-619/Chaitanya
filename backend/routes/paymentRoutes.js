/**
 * 💳 UPI PAYMENT ROUTES
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const SecurityMiddleware = require('../middleware/security');
const { paymentLimiter } = require('../middleware/rateLimit');

// Security middleware
router.use(SecurityMiddleware.sanitizeInput);

// Payment routes
router.get('/config', (req, res) => {
  res.json({
    key: 'upi_payment_system',
    method: 'upi',
    supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI']
  });
});

router.post('/initialize-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.initializePayment
);

router.post('/verify-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.verifyPayment
);

router.get('/status/:sessionId',
  SecurityMiddleware.validateSession,
  paymentController.getPaymentStatus
);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'UPI Payment Gateway',
    status: 'operational'
  });
});

// ✅ REMOVED: The problematic 404 handler
// Let the main server handle 404 for payment routes

module.exports = router;
