# MIDDLEWARE FOLDER

## PURPOSE
This folder contains security and protection layers for Chaitanya 2025 backend.

## FILE OVERVIEW

### 1. auth.js
- **Purpose**: User authentication and access control
- **Contains**: Admin verification, user verification functions
- **Change Here**: Admin access rules, user authentication logic

### 2. ratelimit.js
- **Purpose**: Prevent server overload and abuse
- **Contains**: Rate limiting for registration, admin login, payments
- **Change Here**: Request limits, time windows, error messages

### 3. security.js
- **Purpose**: Clean and validate all incoming data
- **Contains**: Input sanitization, registration validation, payment validation
- **Change Here**: Validation rules, sanitization settings

## HOW TO USE THESE FILES

### Import in your code:
```javascript
const { verifyAdmin, verifyUser } = require('./middleware/auth');
const { registrationLimiter, adminLoginLimiter, paymentLimiter } = require('./middleware/ratelimit');
const SecurityMiddleware = require('./middleware/security');