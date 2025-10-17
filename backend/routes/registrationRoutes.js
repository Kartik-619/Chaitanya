/**
 * 📝 REGISTRATION ROUTES
 * 
 * This file defines all routes for the registration system:
 * - Individual and team registration flows
 * - OTP verification for user authentication
 * - Registration setup and completion
 * - Data retrieval for admin purposes
 * 
 * 🔄 REGISTRATION FLOW:
 * 1. Start → 2. OTP Verify → 3. Setup → 4. Review → 5. Complete
 * 
 * 🔒 SECURITY FEATURES:
 * - Rate limiting on all registration endpoints
 * - Input sanitization and validation
 * - OTP-based user verification
 */

const express = require('express');
const router = express.Router();

// Import controller and middleware
const registrationController = require('../controllers/registrationController');
const SecurityMiddleware = require('../middleware/security');
const { registrationLimiter } = require('../middleware/rateLimit');
// Add admin verification middleware
const { verifyAdmin } = require('../middleware/auth');

/**
 * 🧹 APPLY SECURITY MIDDLEWARE TO ALL REGISTRATION ROUTES
 * 
 * Protects against:
 * - Malicious input injection
 * - Registration spam
 * - Data corruption
 */
router.use(SecurityMiddleware.sanitizeInput);

// ========================
// 🔄 REGISTRATION FLOW ROUTES
// ========================

/**
 * POST /registration/start
 * 
 * Purpose: Begin registration process with basic user info
 * Protection: Rate limiting, registration validation
 * 
 * Process:
 * - Validates name, email, phone, college
 * - Initiates registration session
 * - Sends OTP for verification
 */
router.post('/start', 
  registrationLimiter,                     // Prevent spam registrations
  SecurityMiddleware.validateRegistration, // Validate user input
  registrationController.startRegistration // Begin registration process
);

/**
 * POST /registration/verify-otp
 * 
 * Purpose: Verify user identity using OTP
 * Protection: Rate limiting
 * 
 * Process:
 * - Validates OTP code
 * - Confirms user phone/email
 * - Proceeds to registration setup
 */
router.post('/verify-otp', 
  registrationLimiter,                     // Prevent OTP brute force
  SecurityMiddleware.validateSession,      // Validate session exists
  registrationController.verifyOTP         // Verify user identity
);

/**
 * POST /registration/setup-individual
 * 
 * Purpose: Setup individual registration with event selections
 * Protection: Rate limiting, individual setup validation
 * 
 * Process:
 * - Collects individual event preferences
 * - Handles premium and accommodation options
 * - Calculates individual pricing
 * - Prepares for payment
 */
router.post('/setup-individual', 
  registrationLimiter,                     // Prevent abuse
  SecurityMiddleware.validateSession,      // Validate session
  SecurityMiddleware.validateIndividualSetup, // Validate individual setup data
  registrationController.setupIndividual   // Setup individual registration
);

/**
 * POST /registration/setup-team
 * 
 * Purpose: Setup team registration with team details
 * Protection: Rate limiting, team setup validation
 * 
 * Process:
 * - Collects team information and members
 * - Validates team size and event rules
 * - Selects main team event and E-sports game
 * - Calculates team pricing with accommodation
 */
router.post('/setup-team', 
  registrationLimiter,                     // Prevent abuse
  SecurityMiddleware.validateSession,      // Validate session
  SecurityMiddleware.validateTeamSetup,    // Validate team setup data
  registrationController.setupTeam         // Setup team registration
);

/**
 * POST /registration/review
 * 
 * Purpose: Review registration details before final submission
 * Protection: Rate limiting
 * 
 * Process:
 * - Displays registration summary
 * - Allows user to review all details
 * - Confirms event selections and pricing
 */
router.post('/review', 
  registrationLimiter,                     // Prevent abuse
  SecurityMiddleware.validateSession,      // Validate session
  registrationController.reviewRegistration // Review registration details
);

/**
 * POST /registration/complete
 * 
 * Purpose: Finalize and complete the registration process
 * Protection: Rate limiting
 * 
 * Process:
 * - Saves registration to database
 * - Generates registration ID
 * - Prepares for payment processing
 */
router.post('/complete', 
  registrationLimiter,                     // Prevent abuse
  SecurityMiddleware.validateSession,      // Validate session
  registrationController.completeRegistration // Finalize registration
);

// ========================
// 📊 ADMIN DATA ROUTES
// ========================

/**
 * GET /registration/all
 * 
 * Purpose: Retrieve all registration records (Admin use)
 * Access: Admin verification required
 * 
 * Returns: Complete list of all registrations
 * Use Case: Admin dashboard and reporting
 */
router.get('/all', 
  verifyAdmin,  
  registrationController.getAllRegistrations
);

// ========================
// 🎯 UTILITY ROUTES
// ========================

/**
 * GET /registration/colleges
 * 
 * Purpose: Get list of colleges for dropdown
 * Access: Public
 * 
 * Returns: Array of college names
 * Use Case: Frontend college dropdown population
 */
router.get('/colleges', (req, res) => {
  const { COLLEGE_LIST } = require('../config/constants');
  res.json({
    success: true,
    colleges: COLLEGE_LIST
  });
});

/**
 * GET /registration/team-events
 * 
 * Purpose: Get team events with size rules
 * Access: Public
 * 
 * Returns: Team events with min/max member requirements
 * Use Case: Frontend team event selection
 */
router.get('/team-events', (req, res) => {
  const { TEAM_SIZE_RULES, E_SPORTS_GAMES } = require('../config/constants');
  res.json({
    success: true,
    teamEvents: TEAM_SIZE_RULES,
    esportsGames: E_SPORTS_GAMES
  });
});

/**
 * GET /registration/individual-events
 * 
 * Purpose: Get individual events list
 * Access: Public
 * 
 * Returns: Array of individual event names
 * Use Case: Frontend individual event selection
 */
router.get('/individual-events', (req, res) => {
  const { EVENT_CONFIG } = require('../config/constants');
  res.json({
    success: true,
    individualEvents: EVENT_CONFIG.INDIVIDUAL_EVENTS
  });
});

// Export the router for use in main server file
module.exports = router;