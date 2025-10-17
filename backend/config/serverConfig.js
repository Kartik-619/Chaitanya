/**
 * 🖥️ SERVER SETTINGS
 * 
 * This file contains all settings for the server:
 * - Port number and network settings
 * - Security and protection rules
 * - Session management
 * - Website security policies
 */

const SERVER_CONFIG = {
  // Server port number (5000 for development)
  PORT: process.env.PORT || 5000,
  
  // Security and protection settings
  SECURITY: {
    JSON_LIMIT: '1mb',  // Maximum size of data requests
    CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000', // Which websites can connect
    TRIM_MAX_LENGTH: 255 // Maximum length for text inputs
  },
  
  // Automatic cleanup of old sessions
  SESSION_CLEANUP: {
    INTERVAL: 10 * 60 * 1000, // Clean every 10 minutes
    ENABLED: true  // Turn session cleanup on/off
  },
  
  // Website security rules (protects from attacks)
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],  // Only load from our own server
    scriptSrc: ["'self'", "https://www.gstatic.com", "'unsafe-inline'"], // Allow Google scripts
    connectSrc: ["'self'", "https://identitytoolkit.googleapis.com"], // Connect to Google services
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow CSS styles
    imgSrc: ["'self'", "data:", "https:"] // Allow images from anywhere
  }
};

// Make these settings available to other files
module.exports = { SERVER_CONFIG };