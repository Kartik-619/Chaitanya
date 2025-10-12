const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const SecurityMiddleware = require('../middleware/security');
const { registrationLimiter } = require('../middleware/rateLimit');

// ✅ APPLY: Sanitization to ALL routes
router.use(SecurityMiddleware.sanitizeInput);

// New Individual/Team Registration Flow
router.post('/start', 
  registrationLimiter, 
  SecurityMiddleware.validateRegistration, // ✅ ADD THIS
  registrationController.startRegistration
);

router.post('/verify-otp', 
  registrationLimiter, 
  registrationController.verifyOTP
);

router.post('/setup-individual', 
  registrationLimiter, 
  registrationController.setupIndividual
);

router.post('/setup-team', 
  registrationLimiter, 
  registrationController.setupTeam
);

router.post('/review', 
  registrationLimiter, 
  registrationController.reviewRegistration
);

router.post('/complete', 
  registrationLimiter, 
  registrationController.completeRegistration
);

// Get all registrations
router.get('/all', registrationController.getAllRegistrations);

module.exports = router;