# UTILS FOLDER

## PURPOSE
This folder contains helper functions and calculation utilities for Chaitanya 2025 backend.

## FILE OVERVIEW

### calculationHelpers.js
- **Purpose**: Handle all calculations and statistics for the application
- **Contains**: Amount calculations, event stats, college stats, payment stats, revenue calculations
- **Change Here**: Calculation logic, statistics formulas, data processing rules

## HOW TO USE THIS FILE

### Import in your code:
```javascript
const {
  calculateIndividualAmount,
  calculateTeamAmount,
  calculateEventStats,
  calculateCollegeStats,
  calculatePaymentStats,
  calculateDailyStats,
  calculateRevenueStats
} = require('./utils/calculationHelpers');