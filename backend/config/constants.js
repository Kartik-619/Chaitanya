const requiredEnvVars = [
  'UNIVERSITY_EMAIL_PASSWORD',
  'FRONTEND_URL',
  'DEVELOPMENT_TOKEN',
  'UNIVERSITY_EMAIL' // ✅ ADDED for OTP service
];

// Session configuration
const SESSION_CONFIG = {
  MAX_AGE: 30 * 60 * 1000, // 30 minutes
  CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
  OTP_EXPIRY: 10 * 60 * 1000 // ✅ ADDED OTP expiry (10 minutes)
};

// Google Sheets configuration
const SHEETS_CONFIG = {
  SPREADSHEET_ID: process.env.SHEETS_SPREADSHEET_ID || '1wtmrbVRFW6pOj5bmEbQPFMiTpAlOpezFltS-yOfw7Zo',
  RANGE: 'Registrations!A:S', // ✅ UPDATED columns for new data structure
  EVENTS_RANGE: 'Events Participation!A:J' // ✅ ADDED events sheet
};

// Event configuration
const EVENT_CONFIG = {
  INDIVIDUAL_MIN_EVENTS: 1,
  INDIVIDUAL_MAX_EVENTS: 5,
  TEAM_MIN_SIZE: 2,
  TEAM_MAX_SIZE: 4,
  MAIN_EVENTS: ['Hackathon', 'Accurate Predictions']
};

module.exports = {
  requiredEnvVars,
  SESSION_CONFIG,
  SHEETS_CONFIG,
  EVENT_CONFIG // ✅ ADDED event configuration
};