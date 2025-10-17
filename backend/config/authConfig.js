/**
 * 🔐 AUTHENTICATION SETTINGS
 * 
 * This file contains all the settings for user authentication
 * - How tokens should be handled
 * - What error messages to show users
 */

const AUTH_CONFIG = {
  // Token Settings
  TOKEN_VALIDATION: {
    // How tokens should start in requests
    BEARER_PREFIX: 'Bearer '
  },

  // Error Messages
  ERROR_MESSAGES: {
    // When user doesn't send any token
    NO_TOKEN: 'Access denied. No token provided.',
    
    // When token is wrong or broken
    INVALID_TOKEN: 'Invalid token',
    
    // When user tries to access something they're not allowed to
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
  }
};

// Make this available to other files
module.exports = { AUTH_CONFIG };