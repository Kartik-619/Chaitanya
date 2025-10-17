/**
 * 💳 PAYMENT SETTINGS
 * 
 * This file contains all settings for payment processing:
 * - Razorpay account details
 * - Test/Live mode settings
 * - Payment amounts and currency
 * - Website URLs for redirects
 */

const PAYMENT_CONFIG = {
  // Razorpay account keys (for payment processing)
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID ,      // Test account ID
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET , // Test account secret
  },

  // Test mode or Live mode
  MODE: process.env.PAYMENT_MODE || 'TEST',  // Use 'LIVE' for real payments
  
  // Failure rate for testing (0% = all payments succeed)
  FAILURE_RATE: 0,
  
  // Default payment details for testing
  DEFAULT_PAYMENT: {
    amount: 250000,      // ₹2500.00 (in paise)
    currency: "INR",     // Indian Rupees
    status: "captured",  // Payment successful
    method: "card"       // Payment method
  },
  
  // Time delays for simulation (in milliseconds)
  DELAYS: {
    ORDER_CREATION: 1000,        // 1 second delay
    PAYMENT_VERIFICATION: 1500,  // 1.5 seconds delay
  },

  // Additional payment settings
  CURRENCY: 'INR',  // Indian Rupees
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'  // Website URL for redirects
};

// Make these settings available to other files
module.exports = { PAYMENT_CONFIG };