/**
 * 📋 ATTENDANCE CONTROLLER
 * 
 * This file handles all attendance-related operations:
 * - QR code scanning and attendance marking
 * - Attendance reports and analytics
 * - Duplicate attendance checking
 * 
 * 🎯 RESPONSIBILITIES:
 * - Process QR scan data and mark attendance
 * - Generate attendance reports for events
 * - Prevent duplicate attendance entries
 */

const AttendanceService = require('../services/attendanceService');

class AttendanceController {
  
  /**
   * Scan QR code and mark attendance for an event
   */
  async scanAttendance(req, res) {
    try {
      const { qrData, eventDay = 'Day 1' } = req.body;
      
      if (!qrData) {
        return res.status(400).json({
          success: false,
          message: 'QR data is required'
        });
      }

      // Parse QR data if it's a string
      const parsedQRData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      const result = await AttendanceService.scanAndMarkAttendance(parsedQRData, eventDay);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            type: parsedQRData.type,
            registrationId: result.registrationId,
            teamId: result.teamId,
            teamName: result.teamName,
            eventDay: eventDay,
            timestamp: result.timestamp
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      console.error('❌ Error in scanAttendance:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during attendance scanning'
      });
    }
  }

  /**
   * Get attendance report for a specific event
   */
  async getAttendanceReport(req, res) {
    try {
      const { eventName, eventDay } = req.query;
      
      if (!eventName) {
        return res.status(400).json({
          success: false,
          message: 'Event name is required'
        });
      }

      const result = await AttendanceService.getEventAttendanceReport(eventName, eventDay);
      
      if (result.success) {
        res.json({
          success: true,
          eventName: result.eventName,
          eventDay: result.eventDay,
          totalAttendees: result.totalAttendees,
          attendanceData: result.attendanceData
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      console.error('❌ Error in getAttendanceReport:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching attendance report'
      });
    }
  }

  /**
   * Check if a participant has already attended an event
   */
  async checkDuplicate(req, res) {
    try {
      const { registrationId, eventName, eventDay } = req.query;
      
      if (!registrationId || !eventName || !eventDay) {
        return res.status(400).json({
          success: false,
          message: 'Registration ID, event name, and event day are required'
        });
      }

      const result = await AttendanceService.checkDuplicateAttendance(registrationId, eventName, eventDay);
      
      res.json({
        success: true,
        hasAttended: result.hasAttended,
        existingRecord: result.existingRecord
      });

    } catch (error) {
      console.error('❌ Error in checkDuplicate:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while checking attendance'
      });
    }
  }
}

// Export controller instance
module.exports = new AttendanceController();