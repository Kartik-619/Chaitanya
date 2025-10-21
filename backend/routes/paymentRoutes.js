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
    supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'],
    features: {
      autoVerification: true,
      qrCodeSupport: true,
      amountLock: true,
      securityValidation: true
    }
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

// ========================
// 📊 PAYMENT STATUS & UTILITY
// ========================

/**
 * GET /payment/status/:sessionId
 * 
 * Purpose: Check payment status for a session
 * Access: Public
 * 
 * ✅ NEW: Added endpoint for frontend to check payment status
 */
router.get('/status/:sessionId',
  SecurityMiddleware.validateSession,
  paymentController.getPaymentStatus
);

/**
 * GET /payment/health
 * 
 * Purpose: Check payment service health
 * Access: Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'UPI Payment Gateway',
    status: 'operational',
    timestamp: new Date().toISOString(),
    features: {
      upiPayments: true,
      autoVerification: true,
      securityChecks: true,
      duplicatePrevention: true,
      amountValidation: true
    }
  });
});

/**
 * GET /payment/supported-methods
 * 
 * Purpose: List supported payment methods
 * Access: Public
 */
router.get('/supported-methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        method: 'upi',
        name: 'Unified Payments Interface',
        status: 'active',
        features: [
          'Instant payments',
          'QR code support',
          'Auto-verification',
          'All UPI apps supported'
        ]
      }
    ]
  });
});

// ========================
// 🛡️ SECURITY ENDPOINTS
// ========================

/**
 * POST /payment/validate-amount
 * 
 * Purpose: Validate payment amount before processing
 * Access: Public (with rate limiting)
 */
router.post('/validate-amount',
  paymentLimiter,
  SecurityMiddleware.validateSession,
  (req, res) => {
    try {
      const { sessionId, amount } = req.body;
      
      if (!sessionId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and amount are required'
        });
      }

      // Get registration data from session
      const RegistrationService = require('../services/registrationService');
      const registrationData = RegistrationService.getRegistrationSession(sessionId);
      
      if (!registrationData) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      const expectedAmount = registrationData.totalAmount;
      const isValid = parseFloat(amount) === parseFloat(expectedAmount);

      res.json({
        success: true,
        isValid: isValid,
        expectedAmount: expectedAmount,
        receivedAmount: amount,
        message: isValid ? 'Amount is valid' : `Amount mismatch. Expected: ₹${expectedAmount}`
      });

    } catch (error) {
      console.error('Amount validation error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ========================
// ❌ 404 HANDLER FOR PAYMENT ROUTES
// ========================

/**
 * Handle undefined payment routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Payment endpoint not found',
    availableEndpoints: [
      'GET /api/payment/config',
      'GET /api/payment/health',
      'GET /api/payment/supported-methods',
      'GET /api/payment/status/:sessionId',
      'POST /api/payment/initialize-payment',
      'POST /api/payment/verify-payment',
      'POST /api/payment/validate-amount'
    ]
  });
});

// Export the router for use in main server file
module.exports = router;
