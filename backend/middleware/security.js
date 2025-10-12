const validator = require('validator');
const { VALIDATION_CONFIG } = require('../config/validationConfig');

class SecurityMiddleware {
  
  // Clean and sanitize all incoming data
  static sanitizeInput(req, res, next) {
    try {
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (typeof req.body[key] === 'string') {
            // Remove whitespace and escape HTML characters
            req.body[key] = validator.escape(req.body[key].trim());
            
            // Limit string length to prevent DoS
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

  // Validate registration data - FIXED VERSION
  static validateRegistration(req, res, next) {
    try {
      console.log('🔍 Validating registration data:', JSON.stringify(req.body, null, 2));
      
      const { teamHead, name, email, phone, college, registrationType } = req.body;
      
      // ✅ FIX: Handle both nested teamHead and flat structure
      let personalDetails;
      
      if (teamHead && teamHead.email) {
        // Data is nested in teamHead
        personalDetails = teamHead;
        console.log('📦 Using nested teamHead format');
      } else if (name && email && phone && college) {
        // Data is flat - convert to teamHead structure
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

      // ✅ Validate email
      if (!validator.isEmail(personalDetails.email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }

      // ✅ Validate phone (convert to string first)
      const phoneStr = personalDetails.phone.toString().replace(/\s+/g, '');
      if (!VALIDATION_CONFIG.PHONE_REGEX.test(phoneStr)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid phone number. Must be 10-digit Indian number.' 
        });
      }

      // ✅ Validate name
      if (!personalDetails.name || personalDetails.name.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name must be at least 2 characters long' 
        });
      }

      // ✅ Validate college
      if (!personalDetails.college || personalDetails.college.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'College name is required' 
        });
      }

      // ✅ Validate registration type
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

  // Validate payment data - FIXED VERSION
  static validatePayment(req, res, next) {
    try {
      const { sessionId, amount, razorpay_payment_id, razorpay_order_id } = req.body;
      
      // ✅ FIX: Remove UUID validation
      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Session ID is required' 
        });
      }

      // Basic session ID check
      if (sessionId.length < 10 || sessionId.length > 100) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid session ID' 
        });
      }

      // Amount validation
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

  // ✅ ADD: Session validation method
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
}

module.exports = SecurityMiddleware;