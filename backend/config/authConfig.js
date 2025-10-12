const AUTH_CONFIG = {

  // Token validation
  TOKEN_VALIDATION: {
    MIN_FIREBASE_TOKEN_LENGTH: 100,
    BEARER_PREFIX: 'Bearer '
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NO_TOKEN: 'Access denied. No token provided.',
    INVALID_TOKEN: 'Invalid token',
    FIREBASE_ERROR: 'Authentication failed',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
  }
};

module.exports = { AUTH_CONFIG };