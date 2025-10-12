const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const { verifyAdmin } = require('../middleware/auth');

// Attendance routes
router.post('/scan', AttendanceController.scanAttendance);
router.get('/report', verifyAdmin, AttendanceController.getAttendanceReport);
router.get('/check-duplicate', verifyAdmin, AttendanceController.checkDuplicate);

module.exports = router;