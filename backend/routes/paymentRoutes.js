const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController'); // ✅ FIX: Import the controller
const SecurityMiddleware = require('../middleware/security');
const { paymentLimiter } = require('../middleware/rateLimit');

router.use(SecurityMiddleware.sanitizeInput);

router.get('/config', (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID
  });
});

// ✅ FIXED: Use the imported controller methods
router.post('/initialize-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment,
  SecurityMiddleware.validateSession,
  paymentController.initializePayment // ✅ FIX: Use the controller method
);

router.post('/verify-payment', 
  paymentLimiter,
  SecurityMiddleware.validatePayment, 
  SecurityMiddleware.validateSession,
  paymentController.verifyPayment // ✅ FIX: Use the controller method
);

module.exports = router;