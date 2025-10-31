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
 * Purpose: Prevents people from spamming registration forms
 * Limits: 20 attempts per minute from same IP address
 * 
 * Why: Stops bots from creating fake accounts
 */
const registrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute time window
  max: 20, // Maximum 20 registration attempts per IP per minute
  message: {
    success: false,
    message: 'Too many registration attempts, please try again after 1 minute'
  }
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
 * Purpose: Prevents too many payment attempts
 * Limits: 10 attempts per 15 minutes from same IP address
 * 
 * Why: Stops payment system abuse and protects money transactions
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute time window
  max: 10, // Maximum 10 payment attempts per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many payment attempts, please try again after 15 minutes'
  }
});

// Export all rate limiters for use in routes
module.exports = { 
  registrationLimiter, 
  adminLoginLimiter, 
  paymentLimiter  
};