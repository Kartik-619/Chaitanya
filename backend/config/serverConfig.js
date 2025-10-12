const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  
  // Security settings
  SECURITY: {
    JSON_LIMIT: '1mb',
    CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
    TRIM_MAX_LENGTH: 255
  },
  
  // Session cleanup
  SESSION_CLEANUP: {
    INTERVAL: 10 * 60 * 1000, // 10 minutes
    ENABLED: true
  },
  
  // Helmet CSP configuration
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://www.gstatic.com", "'unsafe-inline'"],
    connectSrc: ["'self'", "https://identitytoolkit.googleapis.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
};

module.exports = { SERVER_CONFIG };