const PAYMENT_CONFIG = {
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_ROugstTZtLU3Hr',
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'g8Hj9PJSgm5tQVs3idtghn4I',
  },

  MODE: process.env.PAYMENT_MODE || 'TEST',
  
  FAILURE_RATE: 0,
  
  DEFAULT_PAYMENT: {
    amount: 250000,
    currency: "INR",
    status: "captured",
    method: "card"
  },
  
  DELAYS: {
    ORDER_CREATION: 1000,
    PAYMENT_VERIFICATION: 1500,
  },

  // Add these new configurations
  CURRENCY: 'INR',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

module.exports = { PAYMENT_CONFIG };