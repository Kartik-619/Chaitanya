const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const AuthController = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/auth');
const { adminLoginLimiter } = require('../middleware/rateLimit');
const SecurityMiddleware = require('../middleware/security'); // ✅ ADD THIS

// ✅ APPLY: Sanitization to ALL routes
router.use(SecurityMiddleware.sanitizeInput);

// Admin authentication
router.post('/login', 
  adminLoginLimiter, 
  AuthController.adminLogin
);

// Protected admin routes
router.get('/stats', 
  verifyAdmin, 
  AdminController.getRegistrationStats
);

router.get('/registrations', 
  verifyAdmin, 
  AdminController.getAllRegistrations
);

router.get('/export-finance', 
  verifyAdmin, 
  AdminController.exportFinanceData
);

router.get('/events', 
  verifyAdmin, 
  AdminController.getEventsData
);

module.exports = router;