const GoogleSheetsService = require('./googleSheetsService');

class StatsService {
  async getRegistrationStats() {
    try {
      console.log('🔄 [STATS] Getting registration stats...');
      
      // Get data from Google Sheets
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      console.log('🔍 [STATS] Sheets result success:', sheetsResult.success);
      
      let registrations = [];
      if (sheetsResult.success && sheetsResult.data) {
        registrations = sheetsResult.data;
        console.log('✅ [STATS] Using Google Sheets data:', registrations.length, 'registrations');
      } else {
        console.log('❌ [STATS] No data from Google Sheets');
        return {
          success: true,
          data: {
            totalRegistrations: 0,
            totalRevenue: 0,
            registrationTypes: { individual: 0, team: 0 },
            events: {},
            colleges: {},
            paymentStatus: { completed: 0, pending: 0, failed: 0 },
            totalParticipants: 0,
            sheetsAvailable: false
          }
        };
      }

      // ✅ FIXED: Calculate statistics properly
      let totalRevenue = 0;
      let individualCount = 0;
      let teamCount = 0;
      let totalParticipants = 0;
      const events = {};
      const colleges = {};
      const paymentStatus = { completed: 0, pending: 0, failed: 0 };

      registrations.forEach(reg => {
        // ✅ FIXED: Use correct amount field
        const amount = parseFloat(reg.amount) || parseFloat(reg.totalAmount) || 0;
        totalRevenue += amount;

        // ✅ FIXED: Count registration types properly
        if (reg.registrationType === 'individual' || reg.registrationId?.includes('IND')) {
          individualCount++;
          totalParticipants++;
        } else {
          teamCount++;
          // ✅ FIXED: Count team members properly
          totalParticipants += parseInt(reg.teamSize) || 1;
        }

        // ✅ FIXED: Track events properly
        if (reg.registrationType === 'individual' && reg.prelimEvents) {
          reg.prelimEvents.forEach(event => {
            events[event] = (events[event] || 0) + 1;
          });
        } else if (reg.mainEvent) {
          events[reg.mainEvent] = (events[reg.mainEvent] || 0) + 1;
        }

        // ✅ FIXED: Track colleges properly
        const college = reg.personalDetails?.college || reg.teamHeadCollege || 'Unknown College';
        colleges[college] = (colleges[college] || 0) + 1;

        // ✅ FIXED: Track payment status properly
        const status = (reg.paymentStatus || 'completed').toLowerCase();
        if (status === 'completed') paymentStatus.completed++;
        else if (status === 'pending') paymentStatus.pending++;
        else if (status === 'failed') paymentStatus.failed++;
      });

      const stats = {
        totalRegistrations: registrations.length,
        totalRevenue: totalRevenue,
        registrationTypes: {
          individual: individualCount,
          team: teamCount
        },
        events: events,
        colleges: colleges,
        paymentStatus: paymentStatus,
        totalParticipants: totalParticipants,
        sheetsAvailable: true
      };

      console.log('📊 [STATS] Final stats:', stats);
      
      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('❌ [STATS] Error:', error);
      return {
        success: false,
        message: 'Failed to load statistics: ' + error.message
      };
    }
  }

  async getFilteredRegistrations(filters = {}) {
    try {
      console.log('🔄 [STATS] Getting filtered registrations...');
      
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      
      if (!sheetsResult.success || !sheetsResult.data) {
        return {
          success: false,
          message: 'No data available'
        };
      }

      let registrations = sheetsResult.data;

      // Apply filters
      const { college, event, payment_status } = filters;
      
      if (college) {
        registrations = registrations.filter(reg => {
          const regCollege = reg.personalDetails?.college || reg.teamHeadCollege || '';
          return regCollege.toLowerCase().includes(college.toLowerCase());
        });
      }

      if (event) {
        registrations = registrations.filter(reg => {
          if (reg.registrationType === 'individual') {
            return (reg.prelimEvents || []).some(e => 
              e.toLowerCase().includes(event.toLowerCase())
            );
          } else {
            return (reg.mainEvent || '').toLowerCase().includes(event.toLowerCase());
          }
        });
      }

      if (payment_status) {
        registrations = registrations.filter(reg =>
          (reg.paymentStatus || '').toLowerCase() === payment_status.toLowerCase()
        );
      }

      return {
        success: true,
        count: registrations.length,
        data: registrations
      };

    } catch (error) {
      console.error('❌ [STATS] Error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  async exportFinanceData() {
    try {
      console.log('🔄 [STATS] Exporting finance data...');
      
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      
      if (!sheetsResult.success || !sheetsResult.data) {
        return {
          success: false,
          message: 'No data available'
        };
      }

      const registrations = sheetsResult.data;
      const financeData = registrations.map(reg => {
        const isIndividual = reg.registrationType === 'individual' || reg.registrationId?.includes('IND');
        
        return {
          'Registration ID': reg.registrationId || 'N/A',
          'Name': reg.personalDetails?.name || reg.teamHeadName || 'N/A',
          'Email': reg.personalDetails?.email || reg.teamHeadEmail || 'N/A',
          'College': reg.personalDetails?.college || reg.teamHeadCollege || 'Not specified',
          'Registration Type': isIndividual ? 'Individual' : 'Team',
          'Main Event': isIndividual ? 'Individual Prelims' : (reg.mainEvent || 'Not specified'),
          'Team Size': reg.teamSize || 1,
          'Amount': parseFloat(reg.amount) || parseFloat(reg.totalAmount) || 0,
          'Payment Status': reg.paymentStatus || 'completed',
          'Registration Date': reg.registrationDate || 'N/A'
        };
      });

      const totalAmount = financeData.reduce((sum, item) => sum + (item.Amount || 0), 0);

      return {
        success: true,
        data: financeData,
        totalAmount: totalAmount,
        totalRegistrations: financeData.length
      };

    } catch (error) {
      console.error('❌ [STATS] Error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }
}

module.exports = new StatsService();