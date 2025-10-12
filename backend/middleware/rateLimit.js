const rateLimit = require('express-rate-limit');

// Limit registration attempts to prevent spam
const registrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 20, // Max 20 registration attempts per IP per minute
  message: {
    success: false,
    message: 'Too many registration attempts, please try again after 1 minute'
  }
});

// Strict limit on admin login to prevent brute force attacks
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // Max 5 login attempts per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 payment attempts per IP
  message: {
    success: false,
    message: 'Too many payment attempts, please try again after 15 minutes'
  }
});

module.exports = { registrationLimiter, adminLoginLimiter, paymentLimiter  };