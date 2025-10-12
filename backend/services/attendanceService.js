const GoogleSheetsService = require('./googleSheetsService');
const QRCode = require('qrcode');

class AttendanceService {
  constructor() {
    console.log('🎫 Attendance Service Ready');
  }

  // Scan QR code and mark attendance
  async scanAndMarkAttendance(qrData, eventDay = 'Day 1') {
    try {
      console.log('🔍 Scanning QR for attendance:', qrData);
      
      const timestamp = new Date().toISOString();
      
      if (qrData.type === 'individual') {
        // Individual attendance
        return await this.markIndividualAttendance(qrData.reg_id, qrData.events, eventDay, timestamp);
      } else if (qrData.type === 'team') {
        // Team attendance - mark all team members
        return await this.markTeamAttendance(qrData.team_id, eventDay, timestamp);
      } else {
        return { success: false, message: 'Invalid QR code type' };
      }
    } catch (error) {
      console.error('❌ Error in scanAndMarkAttendance:', error);
      return { success: false, message: 'Attendance marking failed' };
    }
  }

  // Mark attendance for individual
  async markIndividualAttendance(registrationId, events, eventDay, timestamp) {
    try {
      let markedCount = 0;
      
      for (const event of events) {
        const result = await GoogleSheetsService.updateAttendance(registrationId, event, eventDay, timestamp);
        if (result.success) markedCount++;
      }
      
      return {
        success: true,
        message: `Attendance marked for ${markedCount} event(s)`,
        registrationId: registrationId,
        events: events,
        eventDay: eventDay,
        timestamp: timestamp
      };
    } catch (error) {
      console.error('❌ Error marking individual attendance:', error);
      return { success: false, message: 'Failed to mark individual attendance' };
    }
  }

  // Mark attendance for entire team
  async markTeamAttendance(teamId, eventDay, timestamp) {
    try {
      // Get all team members from registrations
      const registrations = await GoogleSheetsService.getAllRegistrations();
      const teamMembers = registrations.data.filter(reg => reg.teamId === teamId);
      
      let markedCount = 0;
      let teamName = '';
      
      for (const member of teamMembers) {
        if (!teamName && member.teamData) {
          teamName = member.teamData.teamName;
        }
        
        // Mark main event attendance for each member
        if (member.mainEvent) {
          const result = await GoogleSheetsService.updateAttendance(
            member.registrationId, 
            member.mainEvent, 
            eventDay, 
            timestamp
          );
          if (result.success) markedCount++;
        }
      }
      
      return {
        success: true,
        message: `Team attendance marked for ${markedCount} members`,
        teamId: teamId,
        teamName: teamName,
        eventDay: eventDay,
        timestamp: timestamp,
        membersCount: markedCount
      };
    } catch (error) {
      console.error('❌ Error marking team attendance:', error);
      return { success: false, message: 'Failed to mark team attendance' };
    }
  }

  // Get attendance report for an event
  async getEventAttendanceReport(eventName, eventDay = null) {
    try {
      const registrations = await GoogleSheetsService.getAllRegistrations();
      const eventsData = []; // This would come from Events Participation sheet
      
      // Filter by event and day
      const attendanceData = eventsData.filter(event => {
        if (eventDay) {
          return event.eventName === eventName && event.eventDay === eventDay && event.attendanceTime;
        }
        return event.eventName === eventName && event.attendanceTime;
      });
      
      return {
        success: true,
        eventName: eventName,
        eventDay: eventDay,
        totalAttendees: attendanceData.length,
        attendanceData: attendanceData
      };
    } catch (error) {
      console.error('❌ Error getting attendance report:', error);
      return { success: false, message: 'Failed to get attendance report' };
    }
  }

  // Check if person has already attended an event on specific day
  async checkDuplicateAttendance(registrationId, eventName, eventDay) {
    try {
      const eventsData = []; // This would come from Events Participation sheet
      
      const existingAttendance = eventsData.find(event => 
        event.registrationId === registrationId && 
        event.eventName === eventName && 
        event.eventDay === eventDay
      );
      
      return {
        hasAttended: !!existingAttendance,
        existingRecord: existingAttendance
      };
    } catch (error) {
      console.error('❌ Error checking duplicate attendance:', error);
      return { hasAttended: false };
    }
  }
}

module.exports = new AttendanceService();