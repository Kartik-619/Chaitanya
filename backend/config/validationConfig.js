const VALIDATION_CONFIG = {
  PHONE_REGEX: /^[6-9]\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_REGEX: /^[a-zA-Z\s]{2,50}$/,
  
  ERROR_MESSAGES: {
    REQUIRED_FIELDS: 'All required fields must be filled',
    INVALID_PHONE: 'Please enter a valid 10-digit phone number',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_NAME: 'Name must be 2-50 characters long and contain only letters',
    DUPLICATE_EMAIL: 'This email is already registered',
    DUPLICATE_PHONE: 'This phone number is already registered',
    INVALID_EVENT: 'Invalid event selection',
    TEAM_SIZE: 'Team size must be between 2 and 4 members'
  },
  
  MAX_PRELIM_EVENTS: 3,
  MIN_TEAM_SIZE: 2,
  MAX_TEAM_SIZE: 4
};

module.exports = { VALIDATION_CONFIG };