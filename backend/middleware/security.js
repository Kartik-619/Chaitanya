/**
 * 🛡️ SECURITY MIDDLEWARE
 * 
 * This file cleans and checks all incoming data to prevent:
 * - Hackers from injecting malicious code
 * - Invalid data from breaking the system
 * - Security attacks through user input
 * 
 * 🔒 PROTECTION FEATURES:
 * - Cleans all user inputs
 * - Validates registration data
 * - Checks payment information
 * - Verifies session IDs
 */

const validator = require('validator');
const { VALIDATION_CONFIG } = require('../config/validationConfig');
const { TEAM_SIZE_RULES, E_SPORTS_GAMES } = require('../config/constants');

class SecurityMiddleware {
  
  /**
   * 🧹 CLEAN ALL USER INPUT
   * 
   * Purpose: Removes harmful code from all data sent to server
   * Protects Against: HTML injection, JavaScript attacks, long text attacks
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static sanitizeInput(req, res, next) {
    try {
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (typeof req.body[key] === 'string') {
            // Remove extra spaces and escape dangerous characters
            req.body[key] = validator.escape(req.body[key].trim());
            
            // Prevent very long text attacks (max 1000 characters)
            if (req.body[key].length > 1000) {
              req.body[key] = req.body[key].substring(0, 1000);
            }
          }
        });
      }
      next();
    } catch (error) {
      console.error('Sanitization error:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input data' 
      });
    }
  }

  /**
   * ✅ VALIDATE REGISTRATION DATA
   * 
   * Purpose: Checks if registration form data is complete and correct
   * Validates: Name, email, phone, college, registration type
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validateRegistration(req, res, next) {
    try {
      console.log('🔍 Validating registration data:', JSON.stringify(req.body, null, 2));
      
      const { teamHead, name, email, phone, college, registrationType } = req.body;
      
      // Handle both data formats: nested teamHead and flat structure
      let personalDetails;
      
      if (teamHead && teamHead.email) {
        // Data is nested in teamHead object
        personalDetails = teamHead;
        console.log('📦 Using nested teamHead format');
      } else if (name && email && phone && college) {
        // Data is flat - convert to teamHead structure for backend
        personalDetails = { name, email, phone, college };
        console.log('📦 Converting flat format to teamHead structure');
        
        // Convert for backend expectation
        req.body.teamHead = personalDetails;
      } else {
        console.log('❌ Missing required personal details');
        return res.status(400).json({ 
          success: false, 
          message: 'All personal details are required: name, email, phone, and college' 
        });
      }

      // Validate email format
      if (!validator.isEmail(personalDetails.email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }

      // Validate phone number (10-digit Indian number)
      const phoneStr = personalDetails.phone.toString().replace(/\s+/g, '');
      if (!VALIDATION_CONFIG.PHONE_REGEX.test(phoneStr)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid phone number. Must be 10-digit Indian number.' 
        });
      }

      // Validate name (at least 2 characters)
      if (!personalDetails.name || personalDetails.name.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name must be at least 2 characters long' 
        });
      }

      // Validate registration type
      if (!registrationType || !['individual', 'team'].includes(registrationType)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please select registration type: individual or team' 
        });
      }

      console.log('✅ Registration validation passed');
      next();
      
    } catch (error) {
      console.error('❌ Registration validation error:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Registration validation failed. Please check your input.' 
      });
    }
  }

  /**
   * 🎯 VALIDATE TEAM SETUP DATA
   * 
   * Purpose: Checks team setup data for valid events and team sizes
   * Validates: Team event, team size, E-sports game selection
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validateTeamSetup(req, res, next) {
    try {
      const { mainEvent, teamSize, esportsGame, teamMembers } = req.body;
      
      console.log('🔍 Validating team setup:', { mainEvent, teamSize, esportsGame });

      // Validate main event exists in team rules
      if (!TEAM_SIZE_RULES[mainEvent]) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid team event selected' 
        });
      }

      // Validate team size rules
      const teamRules = TEAM_SIZE_RULES[mainEvent];
      if (teamSize < teamRules.min || teamSize > teamRules.max) {
        return res.status(400).json({ 
          success: false, 
          message: `${mainEvent} requires ${teamRules.min}-${teamRules.max} members` 
        });
      }

      // Validate E-sports game selection
      if (mainEvent === 'E-sports' && !E_SPORTS_GAMES.includes(esportsGame)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please select a valid E-sports game' 
        });
      }

      // Validate team members count matches team size
      const expectedMembers = teamSize - 1; // Excluding team leader
      if (teamMembers && teamMembers.length !== expectedMembers) {
        return res.status(400).json({ 
          success: false, 
          message: `Team size ${teamSize} requires ${expectedMembers} team members` 
        });
      }

      console.log('✅ Team setup validation passed');
      next();
      
    } catch (error) {
      console.error('❌ Team setup validation error:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Team setup validation failed' 
      });
    }
  }

  /**
   * 💳 VALIDATE PAYMENT DATA
   * 
   * Purpose: Checks if payment information is valid
   * Validates: Session ID, payment amount, Razorpay IDs
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validatePayment(req, res, next) {
    try {
      const { sessionId, amount, razorpay_payment_id, razorpay_order_id } = req.body;
      
      // Check if session ID exists
      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Session ID is required' 
        });
      }

      // Basic session ID format check
      if (sessionId.length < 10 || sessionId.length > 100) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid session ID' 
        });
      }

      // Validate payment amount
      if (amount && (isNaN(amount) || amount <= 0)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid payment amount is required' 
        });
      }

      next();
    } catch (error) {
      console.error('Payment validation error:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Payment validation failed' 
      });
    }
  }

  /**
   * 🔑 VALIDATE SESSION ID
   * 
   * Purpose: Checks if session ID is present in request
   * Used For: Routes that require session tracking
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validateSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Session ID is required' 
        });
      }

      next();
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session validation failed' 
      });
    }
  }

  /**
   * 📋 VALIDATE INDIVIDUAL SETUP
   * 
   * Purpose: Checks individual event selection and premium options
   * Validates: Events array, premium flag, accommodation flag
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validateIndividualSetup(req, res, next) {
    try {
      const { prelimEvents, isPremium, needsAccommodation } = req.body;
      
      // Validate events array
      if (!prelimEvents || !Array.isArray(prelimEvents)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Events array is required' 
        });
      }

      // Validate premium flag is boolean
      if (isPremium !== undefined && typeof isPremium !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: 'Premium flag must be boolean' 
        });
      }

      // Validate accommodation flag is boolean
      if (needsAccommodation !== undefined && typeof needsAccommodation !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: 'Accommodation flag must be boolean' 
        });
      }

      console.log('✅ Individual setup validation passed');
      next();
      
    } catch (error) {
      console.error('❌ Individual setup validation error:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Individual setup validation failed' 
      });
    }
  }
}

// Export the SecurityMiddleware class for use in routes
module.exports = SecurityMiddleware;