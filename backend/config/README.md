# CONFIG FOLDER README

## PURPOSE
This folder contains all configuration files for Chaitanya 2025 backend.

## FILE OVERVIEW

### 1. authConfig.js
- **Purpose**: Authentication and security settings
- **Contains**: Token validation rules, error messages for login issues
- **Change Here**: Token settings, authentication error messages

### 2. constants.js  
- **Purpose**: Main application settings
- **Contains**: Environment variables list, session timing, Google Sheets IDs, event names
- **Change Here**: Session timeout, spreadsheet IDs, event lists

### 3. emailConfig.js
- **Purpose**: Email and ID card design
- **Contains**: Email service settings, ID card colors, fonts, layouts
- **Change Here**: Email credentials, ID card design, colors, fonts

### 4. envValidator.js
- **Purpose**: Environment validation
- **Contains**: Function to check if all environment variables are set
- **Change Here**: Which environment variables are required

### 5. eventPricing.js
- **Purpose**: Event prices and calculations
- **Contains**: Prices for all events, calculation functions
- **Change Here**: Event prices, team/individual pricing rules

### 6. paymentConfig.js
- **Purpose**: Payment processing settings
- **Contains**: Razorpay keys, payment mode, currency settings
- **Change Here**: Payment gateway settings, test/live mode

### 7. serverConfig.js
- **Purpose**: Server and security settings
- **Contains**: Port number, security rules, CORS settings
- **Change Here**: Server port, security policies, CORS origins

### 8. validationConfig.js
- **Purpose**: Input validation rules
- **Contains**: Phone, email, name validation rules, error messages
- **Change Here**: Validation rules, error messages for forms

## HOW TO USE THESE FILES

### Import in your code:
```javascript
const { AUTH_CONFIG } = require('./config/authConfig');
const { SERVER_CONFIG } = require('./config/serverConfig');
const { VALIDATION_CONFIG } = require('./config/validationConfig');
const { PAYMENT_CONFIG } = require('./config/paymentConfig');
const { EMAIL_CONFIG } = require('./config/emailConfig');
const { EVENT_PRICES, calculateIndividualTotal } = require('./config/eventPricing');
const { requiredEnvVars, SESSION_CONFIG } = require('./config/constants');
const { validateEnvironment } = require('./config/envValidator');