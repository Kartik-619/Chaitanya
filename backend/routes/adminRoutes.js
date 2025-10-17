/**
 * 🛣️ ADMIN ROUTES
 * 
 * This file defines all routes for the admin dashboard:
 * - Admin authentication and login
 * - Registration statistics and data
 * - Financial exports and event management
 * 
 * 🔒 SECURITY FEATURES:
 * - Rate limiting on admin login
 * - Admin verification middleware
 * - Input sanitization on all routes
 * - Protected access to sensitive data
 */

const express = require('express');
const router = express.Router();

// Import controllers
const AdminController = require('../controllers/adminController');
const AuthController = require('../controllers/authController');

// Import middleware
const { verifyAdmin } = require('../middleware/auth');
const { adminLoginLimiter } = require('../middleware/rateLimit');
const SecurityMiddleware = require('../middleware/security'); 

/**
 * 🧹 APPLY SECURITY MIDDLEWARE TO ALL ROUTES
 * 
 * Sanitizes all incoming data to prevent:
 * - HTML/JavaScript injection attacks
 * - Malicious code execution
 * - Data corruption
 */
router.use(SecurityMiddleware.sanitizeInput);

// ========================
// 🔐 AUTHENTICATION ROUTES
// ========================

/**
 * POST /admin/login
 * 
 * Purpose: Admin login with security protection
 * Protection: Rate limiting (5 attempts per 15 minutes)
 * 
 * Prevents brute force attacks on admin credentials
 */
router.post('/login', 
  adminLoginLimiter, 
  AuthController.adminLogin
);

// ========================
// 📊 PROTECTED ADMIN ROUTES
// ========================

/**
 * GET /admin/stats
 * 
 * Purpose: Get registration statistics for dashboard
 * Access: Admin verification required
 * 
 * Shows: Total registrations, event counts, college stats
 */
router.get('/stats', 
  verifyAdmin, 
  AdminController.getRegistrationStats
);

/**
 * GET /admin/registrations
 * 
 * Purpose: Get all registration records
 * Access: Admin verification required
 * 
 * Returns: Complete list of all registrations
 */
router.get('/registrations', 
  verifyAdmin, 
  AdminController.getAllRegistrations
);

/**
 * GET /admin/export-finance
 * 
 * Purpose: Export financial data for accounting
 * Access: Admin verification required
 * 
 * Exports: Payment records, revenue data, transaction history
 */
router.get('/export-finance', 
  verifyAdmin, 
  AdminController.exportFinanceData
);

/**
 * GET /admin/events
 * 
 * Purpose: Get event participation data
 * Access: Admin verification required
 * 
 * Returns: Event-wise registration counts and details
 */
router.get('/events', 
  verifyAdmin, 
  AdminController.getEventsData
);

/**
 * GET /admin/premium-analytics
 * 
 * Purpose: Get premium registration analytics
 * Access: Admin verification required
 * 
 * Returns: Premium package statistics and revenue
 */
router.get('/premium-analytics', 
  verifyAdmin, 
  AdminController.getPremiumAnalytics
);

/**
 * GET /admin/accommodation-analytics
 * 
 * Purpose: Get accommodation booking analytics
 * Access: Admin verification required
 * 
 * Returns: Accommodation statistics and revenue
 */
router.get('/accommodation-analytics', 
  verifyAdmin, 
  AdminController.getAccommodationAnalytics
);

// ========================
// 🎯 CONFIGURATION ROUTES
// ========================

/**
 * GET /admin/colleges
 * 
 * Purpose: Get college list for reference
 * Access: Admin verification required
 * 
 * Returns: Array of all available colleges
 */
router.get('/colleges', 
  verifyAdmin, 
  (req, res) => {
    const { COLLEGE_LIST } = require('../config/constants');
    res.json({
      success: true,
      colleges: COLLEGE_LIST,
      count: COLLEGE_LIST.length
    });
  }
);

/**
 * GET /admin/team-rules
 * 
 * Purpose: Get team size rules for reference
 * Access: Admin verification required
 * 
 * Returns: Team event size requirements
 */
router.get('/team-rules', 
  verifyAdmin, 
  (req, res) => {
    const { TEAM_SIZE_RULES, E_SPORTS_GAMES } = require('../config/constants');
    res.json({
      success: true,
      teamRules: TEAM_SIZE_RULES,
      esportsGames: E_SPORTS_GAMES
    });
  }
);

// Export the router for use in main server file
module.exports = router;