/**
 * ✅ INPUT VALIDATION SETTINGS
 * 
 * This file contains rules for checking user input:
 * - Phone number format validation
 * - Email format validation  
 * - Name format validation
 * - Error messages for wrong inputs
 */

const VALIDATION_CONFIG = {
  // Rules for checking phone numbers (10 digits starting with 6-9)
  PHONE_REGEX: /^[6-9]\d{9}$/,
  
  // Rules for checking email format (must have @ and .)
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Rules for checking names (2-50 letters and spaces only)
  NAME_REGEX: /^[a-zA-Z\s]{2,50}$/,
  
  // Error messages to show users when input is wrong
  ERROR_MESSAGES: {
    REQUIRED_FIELDS: 'All required fields must be filled',
    INVALID_PHONE: 'Please enter a valid 10-digit phone number',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_NAME: 'Name must be 2-50 characters long and contain only letters',
    INVALID_TEAM_SIZE: 'Team size does not meet event requirements',
    INVALID_ESPORTS_GAME: 'Please select a valid E-sports game',
    DUPLICATE_EMAIL: 'This email is already registered',
    DUPLICATE_PHONE: 'This phone number is already registered',
    INVALID_EVENT_SELECTION: 'Please select valid events',
    INVALID_PREMIUM_FLAG: 'Premium selection must be true or false',
    INVALID_ACCOMMODATION_FLAG: 'Accommodation selection must be true or false'
  }
};

// Make these validation rules available to other files
module.exports = { VALIDATION_CONFIG };