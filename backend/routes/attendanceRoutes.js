/**
 * 📋 ATTENDANCE ROUTES
 * 
 * This file defines all routes for attendance management:
 * - QR code scanning for event attendance
 * - Attendance reports and analytics
 * - Duplicate entry checking
 * 
 * 🎯 USE CASES:
 * - Event check-in via QR codes
 * - Admin viewing attendance reports
 * - Preventing duplicate registrations
 */

const express = require('express');
const router = express.Router();

// Import controller and middleware
const AttendanceController = require('../controllers/attendanceController');
const { verifyAdmin } = require('../middleware/auth');

// ========================
// 🔍 ATTENDANCE SCANNING ROUTES
// ========================

/**
 * POST /attendance/scan
 * 
 * Purpose: Scan QR code and record attendance
 * Access: Public (for scanning devices)
 * 
 * Process:
 * - Reads QR code data
 * - Validates registration ID
 * - Records attendance timestamp
 * - Prevents duplicate entries
 */
router.post('/scan', AttendanceController.scanAttendance);

/**
 * GET /attendance/report
 * 
 * Purpose: Get comprehensive attendance report
 * Access: Admin verification required
 * 
 * Returns:
 * - Event-wise attendance counts
 * - Participant details
 * - Time-based analytics
 * - College participation stats
 */
router.get('/report', verifyAdmin, AttendanceController.getAttendanceReport);

/**
 * GET /attendance/check-duplicate
 * 
 * Purpose: Check for duplicate attendance entries
 * Access: Admin verification required
 * 
 * Use Case:
 * - Audit attendance records
 * - Identify potential fraud
 * - Clean up duplicate entries
 */
router.get('/check-duplicate', verifyAdmin, AttendanceController.checkDuplicate);

// Export the router for use in main server file
module.exports = router;