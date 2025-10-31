/**
 * 🚦 RATE LIMITING MIDDLEWARE
 * 
 * This file protects the server from too many requests by:
 * - Limiting how many times people can register
 * - Protecting admin login from hackers
 * - Preventing too many payment attempts
 * 
 * 🛡️ SECURITY BENEFITS:
 * - Stops spam and abuse
 * - Prevents brute force attacks
 * - Protects server from being overloaded
 */

const rateLimit = require('express-rate-limit');

/**
 * 📝 REGISTRATION RATE LIMIT
 * 
 * Purpose: Prevents spam while allowing legitimate high traffic
 * Limits: 50 attempts per minute from same IP (increased for events)
 * 
 * Why: Balances security with user experience during peak registration
 */
const registrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute time window
  max: 50, // Increased from 20 to 50 for high-traffic events
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please wait 1 minute and try again.',
    retryAfter: 60
  }
  // Removed custom keyGenerator to avoid IPv6 issues - using default IP-based tracking
});

/**
 * 🔐 ADMIN LOGIN RATE LIMIT  
 * 
 * Purpose: Protects admin login from hacker attacks
 * Limits: 5 attempts per 15 minutes from same IP address
 * 
 * Why: Makes it very hard for hackers to guess passwords
 */
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute time window
  max: 5, // Maximum 5 login attempts per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

/**
 * 💳 PAYMENT RATE LIMIT
 * 
 * Purpose: Prevents payment abuse while allowing retries
 * Limits: 20 attempts per 15 minutes (increased for legitimate retries)
 * 
 * Why: Balances security with payment gateway retry scenarios
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute time window
  max: 20, // Increased from 10 to 20 for payment retries
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment attempts. Please wait 15 minutes and try again.',
    retryAfter: 900
  }
});

// Export all rate limiters for use in routes
module.exports = { 
  registrationLimiter, 
  adminLoginLimiter, 
  paymentLimiter  
};