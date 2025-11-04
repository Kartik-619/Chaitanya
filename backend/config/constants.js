/**
 * ⚙️ APP SETTINGS
 * 
 * This file contains all main settings for the application
 * - What passwords and keys are needed
 * - How long user sessions last
 * - Where to store data in Google Sheets
 * - What events are available
 */

// List of required passwords and keys
const requiredEnvVars = [
  'UNIVERSITY_EMAIL_PASSWORD',  // Password for sending emails
  'FRONTEND_URL',               // Website address
  'DEVELOPMENT_TOKEN',          // Test token for development
  'UNIVERSITY_EMAIL',           // Email address for sending OTPs
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

// User session settings
const SESSION_CONFIG = {
  MAX_AGE: 30 * 60 * 1000,        // User stays logged in for 30 minutes
  CLEANUP_INTERVAL: 10 * 60 * 1000, // Clean old sessions every 10 minutes
  OTP_EXPIRY: 10 * 60 * 1000      // OTP codes expire after 10 minutes
};

// Google Sheets settings
const SHEETS_CONFIG = {
  // ID of the Google Sheet where data is stored
  SPREADSHEET_ID: process.env.SHEETS_SPREADSHEET_ID || '1wtmrbVRFW6pOj5bmEbQPFMiTpAlOpezFltS-yOfw7Zo',
  
  // Where to save registration data (Columns A to S)
  RANGE: 'Registrations!A:X',
  
  // Where to save event participation data
  EVENTS_RANGE: 'Events Participation!A:L'
};

// Team size rules for each team event
const TEAM_SIZE_RULES = {
  "Singing": { min: 2, max: 10 },
  "Dance": { min: 2, max: 10 },
  "Hackathon": { min: 2, max: 4 },
  "Accurate Prediction": { min: 2, max: 4 },
  "E-sports": { min: 4, max: 5 }, // Fixed 4 members
  "Polymath": { min: 2, max: 4 },
  "Debate": { min: 2, max: 2 }, // Fixed 2 members
  "Two Minute Manager": { min: 2, max: 2 }, // Fixed 2 members
  "Capture The Flag": { min: 2, max: 4 },
  "Pitch High": { min: 1, max: 3 }
};

// E-sports games available
const E_SPORTS_GAMES = ["BGMI", "FF Max", "Valorant"];

// Event settings
const EVENT_CONFIG = {
  // Individual events
  INDIVIDUAL_EVENTS: [
    "Integration Bee",
    "Human vs AI", 
    "Retro Theming",
    "Prompt Engineering",
    "Reverse Engineering",
    "Jack of Hearts",
    "Singing",
    "Dancing",
    "Project Bazaar"
  ],
  
  // Team events
  TEAM_EVENTS: [
    "Singing",
    "Dance", 
    "Hackathon",
    "Accurate Prediction",
    "E-sports",
    "Polymath",
    "Debate",
    "Two Minute Manager",
    "Capture The Flag",
     "Pitch High"
  ],
  
  // Premium settings
  PREMIUM_FEE: 49,
  ACCOMMODATION_FEE: 300,
  FOOD_FEE: 300
};

// Export all settings
module.exports = {
  requiredEnvVars,
  SESSION_CONFIG,
  SHEETS_CONFIG,
  TEAM_SIZE_RULES,
  E_SPORTS_GAMES,
  EVENT_CONFIG
};
