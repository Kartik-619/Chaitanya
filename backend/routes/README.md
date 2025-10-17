# 🛣️ ROUTES FOLDER

## PURPOSE
This folder contains all API route definitions for Chaitanya 2025 backend.

## FILE OVERVIEW

### 1. adminRoutes.js
- **Purpose**: Admin dashboard and management endpoints
- **Contains**: Authentication, statistics, registration data, financial exports
- **Security**: Admin verification, rate limiting, input sanitization

### 2. attendanceRoutes.js
- **Purpose**: Event attendance tracking and management
- **Contains**: QR scanning, attendance reports, duplicate checks
- **Security**: Admin verification for reports, public access for scanning

### 3. debugRoutes.js
- **Purpose**: Development and testing endpoints
- **Contains**: Environment checks, service connectivity tests
- **Security**: Public access (development only)

### 4. paymentRoutes.js
- **Purpose**: Payment processing and verification
- **Contains**: Payment initialization, verification, configuration
- **Security**: Rate limiting, payment validation, session validation

### 5. registrationRoutes.js
- **Purpose**: User registration system
- **Contains**: Registration flow, OTP verification, individual/team setup
- **Security**: Rate limiting, input validation, OTP authentication

## HOW TO USE THESE FILES

### Import in your code:
```javascript
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const debugRoutes = require('./routes/debugRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const registrationRoutes = require('./routes/registrationRoutes');