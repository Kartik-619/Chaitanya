# 🛠️ SERVICES FOLDER

## PURPOSE
This folder contains all business logic and service layer components for Chaitanya 2025 backend.

## FILE OVERVIEW

### 1. attendanceService.js
- **Purpose**: Event attendance tracking and management
- **Contains**: QR code scanning, attendance marking, reports, duplicate checking
- **Dependencies**: GoogleSheetsService, QRCode
- **Key Methods**: scanAndMarkAttendance(), getEventAttendanceReport(), checkDuplicateAttendance()

### 2. backupService.js
- **Purpose**: Data backup and recovery operations
- **Contains**: Session backup, failed registration recovery, automatic retry system
- **Dependencies**: File system, RegistrationService, GoogleSheetsService
- **Key Methods**: saveSessionsToFile(), restoreSessions(), retryFailedRegistrations()

### 3. emailService.js
- **Purpose**: Email and ID card operations
- **Contains**: Registration confirmations, PDF ID card generation, queue management
- **Dependencies**: Nodemailer, PDFKit, QRCode
- **Key Methods**: sendIndividualConfirmation(), sendTeamConfirmation(), generateIndividualIDCard()

### 4. googleSheetsService.js
- **Purpose**: Google Sheets integration and data management
- **Contains**: Registration storage, event participation tracking, attendance updates
- **Dependencies**: Google APIs, Sheets configuration
- **Key Methods**: saveRegistration(), getAllRegistrations(), saveToEventsSheet()

### 5. otpService.js
- **Purpose**: OTP generation and delivery
- **Contains**: Email/SMS OTP sending, verification, expiry management
- **Dependencies**: Nodemailer, session configuration
- **Key Methods**: generateAndSendOTP(), verifyOTP(), sendOTPEmail()

### 6. paymentService.js
- **Purpose**: Payment processing with Razorpay
- **Contains**: Order creation, payment verification, transaction management
- **Dependencies**: Razorpay SDK, crypto, payment configuration
- **Key Methods**: initializePayment(), verifyPayment(), createOrder()

### 7. registrationService.js
- **Purpose**: Complete registration lifecycle management
- **Contains**: Session management, OTP verification, individual/team flows, payment integration
- **Dependencies**: UUID, calculation helpers, validation config
- **Key Methods**: createRegistrationSession(), verifyOTP(), completeRegistration()

### 8. statsService.js
- **Purpose**: Statistics and analytics operations
- **Contains**: Registration analytics, financial reports, data filtering
- **Dependencies**: GoogleSheetsService
- **Key Methods**: getRegistrationStats(), getFilteredRegistrations(), exportFinanceData()

## HOW TO USE THESE FILES

### Import in your code:
```javascript
const AttendanceService = require('./services/attendanceService');
const BackupService = require('./services/backupService');
const EmailService = require('./services/emailService');
const GoogleSheetsService = require('./services/googleSheetsService');
const OTPService = require('./services/otpService');
const PaymentService = require('./services/paymentService');
const RegistrationService = require('./services/registrationService');
const StatsService = require('./services/statsService');