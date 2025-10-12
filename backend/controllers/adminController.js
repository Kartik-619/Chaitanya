const StatsService = require('../services/statsService');
const GoogleSheetsService = require('../services/googleSheetsService');

// ✅ FUCKING FIXED: Event prices as a simple object - NO "this" BULLSHIT
const EVENT_PRICES = {
  'Code Forge': 200,
  'Encryption/Decryption': 150, 
  'Reverse Engineering': 200,
  'Stock Prediction': 200,
  'Bug Bounty / CTF': 300,
  'Integration Bee': 150,
  'Robo Rampage': 250,
  'Web Weaving': 180,
  'Hackathon': 2500,
  'Accurate Predictions': 2500
};

class AdminController {
  
  // Get registration statistics
  async getRegistrationStats(req, res) {
    try {
      console.log('📊 AdminController: getRegistrationStats called');
      const result = await StatsService.getRegistrationStats();
      console.log('📊 AdminController: Stats result:', result.success);
      res.json(result);
    } catch (error) {
      console.error('❌ Error in getRegistrationStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all registrations with filters
  async getAllRegistrations(req, res) {
    try {
      console.log('📋 AdminController: getAllRegistrations called');
      const { college, event, payment_status } = req.query;
      
      const result = await StatsService.getFilteredRegistrations({
        college, event, payment_status
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('❌ Error in getAllRegistrations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Export data for finance department
  async exportFinanceData(req, res) {
    try {
      console.log('💳 AdminController: exportFinanceData called');
      const result = await StatsService.exportFinanceData();

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('❌ Error in exportFinanceData:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Get events participation data - ✅ FINALLY FUCKING FIXED
  async getEventsData(req, res) {
    try {
      console.log('📊 Fetching events participation data...');
      
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      
      if (!sheetsResult.success || !sheetsResult.data) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No events data available yet'
        });
      }

      console.log(`📊 Processing ${sheetsResult.data.length} registrations for events data...`);
      
      const eventsData = [];
      let totalEventCount = 0;
      
      // ✅ NO MORE "this" BULLSHIT - JUST USE THE FUCKING OBJECT DIRECTLY
      sheetsResult.data.forEach((registration) => {
        const amount = parseFloat(registration.amount) || parseFloat(registration.totalAmount) || 0;
        
        // Individual registration events
        if (registration.registrationType === 'individual' && registration.prelimEvents) {
          registration.prelimEvents.forEach(event => {
            if (event && event.trim() !== '') {
              eventsData.push({
                registrationId: registration.registrationId,
                name: registration.personalDetails?.name || 'N/A',
                email: registration.personalDetails?.email || 'N/A',
                eventName: event,
                eventType: 'Prelim',
                eventPrice: EVENT_PRICES[event] || 0, // ✅ DIRECT OBJECT ACCESS - NO METHODS
                registrationType: 'individual',
                college: registration.personalDetails?.college || 'N/A',
                totalAmount: amount
              });
              totalEventCount++;
            }
          });
        }
        
        // Team registration events
        if (registration.registrationType === 'team') {
          // Main event for team leader
          if (registration.mainEvent) {
            eventsData.push({
              registrationId: registration.registrationId,
              name: registration.teamLeader?.name || 'Team Leader',
              email: registration.teamLeader?.email || 'N/A',
              eventName: registration.mainEvent,
              eventType: 'Main',
              eventPrice: EVENT_PRICES[registration.mainEvent] || 0, // ✅ DIRECT OBJECT ACCESS
              registrationType: 'team',
              college: registration.teamLeader?.college || 'N/A',
              totalAmount: amount
            });
            totalEventCount++;
          }
          
          // Team leader prelim events (free)
          if (registration.teamLeader?.prelimEvents && Array.isArray(registration.teamLeader.prelimEvents)) {
            registration.teamLeader.prelimEvents.forEach(event => {
              if (event && event.trim() !== '') {
                eventsData.push({
                  registrationId: registration.registrationId + '-L',
                  name: registration.teamLeader.name,
                  email: registration.teamLeader.email,
                  eventName: event,
                  eventType: 'Prelim',
                  eventPrice: 0, // Free for team members
                  registrationType: 'team',
                  college: registration.teamLeader.college || 'N/A',
                  totalAmount: 0
                });
                totalEventCount++;
              }
            });
          }
          
          // Team members prelim events (free)
          if (registration.teamMembers && Array.isArray(registration.teamMembers)) {
            registration.teamMembers.forEach((member, index) => {
              if (member.prelimEvents && Array.isArray(member.prelimEvents)) {
                member.prelimEvents.forEach(event => {
                  if (event && event.trim() !== '') {
                    eventsData.push({
                      registrationId: `${registration.registrationId}-M${index + 1}`,
                      name: member.name || `Team Member ${index + 1}`,
                      email: member.email || 'N/A',
                      eventName: event,
                      eventType: 'Prelim',
                      eventPrice: 0, // Free for team members
                      registrationType: 'team',
                      college: member.college || 'N/A',
                      totalAmount: 0
                    });
                    totalEventCount++;
                  }
                });
              }
            });
          }
        }
      });

      console.log(`✅ Processed ${totalEventCount} event records from ${sheetsResult.data.length} registrations`);
      
      res.json({
        success: true,
        data: eventsData,
        count: eventsData.length,
        totalRegistrations: sheetsResult.data.length,
        message: `Found ${eventsData.length} event participation records from ${sheetsResult.data.length} registrations`
      });

    } catch (error) {
      console.error('❌ Error fetching events data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events data: ' + error.message
      });
    }
  }
}

module.exports = new AdminController();