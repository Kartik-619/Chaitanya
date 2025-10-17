# CONTROLLERS FOLDER README

## PURPOSE
This folder contains all controller files that handle business logic for Chaitanya 2025 backend.

## FILE OVERVIEW

### 1. adminController.js
- **Purpose**: Admin dashboard operations and data management
- **Contains**: Registration statistics, event data, financial exports, filtered registrations
- **Change Here**: Admin reporting logic, data filtering, statistics calculations

### 2. attendanceController.js
- **Purpose**: Attendance tracking and management
- **Contains**: QR code scanning, attendance reports, duplicate checking
- **Change Here**: Attendance logic, scanning rules, report generation

### 3. authController.js
- **Purpose**: Authentication and user verification
- **Contains**: Admin login, credential validation
- **Change Here**: Login logic, authentication rules, user verification

### 4. paymentController.js
- **Purpose**: Payment processing and verification
- **Contains**: Payment initialization, Razorpay integration, payment verification
- **Change Here**: Payment flow, order creation, verification logic

### 5. registrationController.js
- **Purpose**: Complete registration flow management
- **Contains**: Multi-phase registration, OTP verification, individual/team setup
- **Change Here**: Registration logic, OTP handling, data validation

## HOW TO USE THESE FILES

### Import in your code:
```javascript
const adminController = require('./controllers/adminController');
const attendanceController = require('./controllers/attendanceController');
const authController = require('./controllers/authController');
const paymentController = require('./controllers/paymentController');
const registrationController = require('./controllers/registrationController');