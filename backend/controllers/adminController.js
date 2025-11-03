/**
 * 🎯 ADMIN CONTROLLER
 * 
 * This file handles all admin dashboard operations:
 * - Registration statistics and analytics
 * - Data filtering and export functionality
 * - Event participation tracking
 * - Financial data management
 * 
 * 📊 RESPONSIBILITIES:
 * - Process admin data requests
 * - Generate reports and statistics
 * - Handle data filtering and exports
 * - Manage event participation data
 */

const StatsService = require('../services/statsService');
const GoogleSheetsService = require('../services/googleSheetsService');

// Event pricing configuration for calculations - UPDATED WITH NEW EVENTS
const EVENT_PRICES = {
  // Individual Events
  'Integration Bee': 299,
  'Human vs AI': 299,
  'Retro Theming': 199,
  'Prompt Engineering': 199,
  'Reverse Engineering': 199,
  'Jack of Hearts': 399,
  'Singing': 99,
  'Dancing': 99,
 

  // Team Events
  'Singing Team': 99,
  'Dance Team': 99,
  'Hackathon Team': 999,
  'Accurate Prediction Team': 999,
  'E-sports Team': 999,
  'Polymath Team': 499,
  'Reverse Engineering Team': 199,
  'Retro Theming Team': 199,
  'Debate Team': 199,
  'Two Minute Manager Team': 149,
  'Pitch High':0,
};

class AdminController {
  
  /**
   * Get comprehensive registration statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
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

  /**
   * Get all registrations with optional filters
   * @param {Object} req - Express request object with query parameters
   * @param {Object} res - Express response object
   */
  async getAllRegistrations(req, res) {
    try {
      console.log('📋 AdminController: getAllRegistrations called');
      const { college, event, payment_status, registration_type } = req.query;
      
      const result = await StatsService.getFilteredRegistrations({
        college, event, payment_status, registration_type
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

  /**
   * Export financial data for accounting purposes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
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
  
  /**
   * Get detailed event participation data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
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
                eventPrice: EVENT_PRICES[event] || 0, 
                registrationType: 'individual',
                college: registration.personalDetails?.college || 'N/A',
                totalAmount: amount,
                isPremium: registration.isPremium || false,
                needsAccommodation: registration.needsAccommodation || false
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
              eventPrice: EVENT_PRICES[`${registration.mainEvent} Team`] || 0, 
              registrationType: 'team',
              college: registration.teamLeader?.college || 'N/A',
              totalAmount: amount,
              teamSize: registration.teamSize || 1,
              esportsGame: registration.esportsGame || 'N/A',
              needsAccommodation: registration.needsAccommodation || false
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
                  totalAmount: 0,
                  isPremium: false
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
                      totalAmount: 0,
                      isPremium: false
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

  /**
   * Get premium registration analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPremiumAnalytics(req, res) {
    try {
      console.log('⭐ AdminController: getPremiumAnalytics called');
      
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      
      if (!sheetsResult.success || !sheetsResult.data) {
        return res.json({
          success: true,
          premiumCount: 0,
          totalRevenue: 0,
          premiumRevenue: 0,
          data: []
        });
      }

      const premiumRegistrations = sheetsResult.data.filter(reg => reg.isPremium);
      const premiumRevenue = premiumRegistrations.reduce((sum, reg) => {
        return sum + (parseFloat(reg.totalAmount) || 0);
      }, 0);

      const totalRevenue = sheetsResult.data.reduce((sum, reg) => {
        return sum + (parseFloat(reg.totalAmount) || 0);
      }, 0);

      res.json({
        success: true,
        premiumCount: premiumRegistrations.length,
        totalRegistrations: sheetsResult.data.length,
        premiumRevenue: premiumRevenue,
        totalRevenue: totalRevenue,
        premiumPercentage: sheetsResult.data.length > 0 ? 
          ((premiumRegistrations.length / sheetsResult.data.length) * 100).toFixed(2) + '%' : '0%',
        data: premiumRegistrations
      });

    } catch (error) {
      console.error('❌ Error in getPremiumAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get accommodation analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAccommodationAnalytics(req, res) {
    try {
      console.log('🏨 AdminController: getAccommodationAnalytics called');
      
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      
      if (!sheetsResult.success || !sheetsResult.data) {
        return res.json({
          success: true,
          accommodationCount: 0,
          totalParticipants: 0,
          accommodationRevenue: 0,
          data: []
        });
      }

      const accommodationRegistrations = sheetsResult.data.filter(reg => reg.needsAccommodation);
      
      // Calculate total participants needing accommodation
      let totalParticipants = 0;
      accommodationRegistrations.forEach(reg => {
        if (reg.registrationType === 'individual') {
          totalParticipants += 1;
        } else if (reg.registrationType === 'team') {
          totalParticipants += (reg.teamSize || 1);
        }
      });

      const accommodationRevenue = totalParticipants * 600; // ₹600 per person

      res.json({
        success: true,
        accommodationCount: accommodationRegistrations.length,
        totalParticipants: totalParticipants,
        accommodationRevenue: accommodationRevenue,
        data: accommodationRegistrations
      });

    } catch (error) {
      console.error('❌ Error in getAccommodationAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Export controller instance
module.exports = new AdminController();