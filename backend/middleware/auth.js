/**
 * 🔐 AUTHENTICATION MIDDLEWARE
 * 
 * This file contains security checks for:
 * - Admin access to protected routes
 * - User verification for participants
 * 
 * 🛡️ WHAT IT DOES:
 * - Verifies if user has admin privileges
 * - Prepares for future user authentication
 * - Adds user information to requests
 */

/**
 * ✅ ADMIN VERIFICATION MIDDLEWARE
 * 
 * Purpose: Allows access to admin-only routes
 * Usage: Add to routes that only admins should access
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const verifyAdmin = async (req, res, next) => {
    try {
        // Currently allows all access - frontend handles authentication
        // In future, add proper admin authentication here
        
        // Add admin user information to the request
        req.user = { 
            role: 'admin', 
            email: process.env.ADMIN_EMAIL || 'chaitanyahptu@gmail.com'
        };
        
        // Continue to the next function
        next();

    } catch (error) {
        // Log any errors that occur
        console.error('Auth middleware error:', error);
        
        // Send error response to client
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

/**
 * 👤 USER VERIFICATION MIDDLEWARE (FOR FUTURE USE)
 * 
 * Purpose: Will verify regular users/participants
 * Currently: Placeholder for future OTP/session based authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyUser = async (req, res, next) => {
    // TODO: Add OTP or session based user verification here
    // This will check if participant is properly authenticated
    
    // For now, just continue to next function
    next();
};

// Export both middleware functions for use in routes
module.exports = { verifyAdmin, verifyUser };