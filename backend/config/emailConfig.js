/**
 * 📧 EMAIL AND ID CARD SETTINGS
 * 
 * This file contains all settings for:
 * - Sending emails to users
 * - Designing ID cards for registered users
 */

const ID_CONFIG = {
  INDIVIDUAL_PREFIX: 'CH25-I',
  TEAM_PREFIX: 'CH25-T', 
  MAX_INDIVIDUAL_ID: 9999,  // 4 digits = 10,000 participants
  MAX_TEAM_ID: 999,         // 3 digits = 1,000 teams
  ID_LENGTH: 10             // CH25-I1234 = 10 chars max
};

const EMAIL_CONFIG = {
  // Email sending settings - USE ENVIRONMENT VARIABLES
  SERVICE: 'Gmail',
  FROM_EMAIL: process.env.UNIVERSITY_EMAIL || 'chaitanyahptu@gmail.com',  // FIXED: Use env variable
  FROM_NAME: 'Chaitanya 2025 Team',
  
  // ID Card design - colors and sizes
  ID_CARD: {
    SIZE: [540, 320],        // Width and height of ID card
    MARGIN: 0,               // No space around the card
    PRIMARY_COLOR: '#8B0000', // Main red color for headings
    BACKGROUND_COLOR: '#f7f7f9', // Light gray background
    CARD_COLOR: '#ffffff',    // White card color
    BORDER_COLOR: '#e0e0e0', // Light gray border
    LEFT_PANEL_WIDTH: 160,   // Width of left colored panel
    PROFILE_RADIUS: 48       // Size of profile picture circle
  },
  
  // Text sizes for ID card
  FONT_SIZES: {
    EVENT_TITLE: 13,         // "CHAITANYA 2025" text size
    EVENT_SUBTITLE: 9,       // "Cultural Fest" text size
    PROFILE_INITIALS: 28,    // User initials inside circle
    STUDENT_NAME: 20,        // Student name text size
    COLLEGE: 10,             // College name text size
    REGISTRATION_ID: 11,     // Registration number text size
    EVENTS: 9,               // Event names text size
    AMOUNT: 10,              // Payment amount text size
    QR_LABEL: 8,             // "Scan QR Code" text size
    FOOTER: 9                // Footer text size
  },
  
  // Where to place things on ID card
  POSITIONS: {
    CARD_OFFSET: 12,         // Space around card edges
    LEFT_PANEL_OFFSET: 8,    // Space inside left panel
    EVENT_TITLE: { x: 20, y: 22 },    // "CHAITANYA 2025" position
    EVENT_SUBTITLE: { x: 20, y: 44 }, // "Cultural Fest" position
    PROFILE_CENTER: { y: 108 },       // Profile circle vertical position
    CONTENT_OFFSET: 20,      // Space before content starts
    QR_SIZE: 92,             // QR code size (width and height)
    QR_OFFSET: 18,           // Space around QR code
    FOOTER_HEIGHT: 28        // Height of footer area
  }
};

// Make these settings available to other files
module.exports = { EMAIL_CONFIG, ID_CONFIG };
