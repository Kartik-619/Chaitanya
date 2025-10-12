const { calculateIndividualTotal, calculateTeamTotal } = require('../config/eventPricing');

// Calculate individual amount based on selected prelim events
const calculateIndividualAmount = (prelimEvents) => {
  console.log('🧮 Calculating individual amount for events:', prelimEvents);
  
  // ✅ FIX: Call the correct function from eventPricing
  const amount = calculateIndividualTotal(prelimEvents);
  console.log('💰 Calculated amount:', amount);
  
  return amount;
};

// Calculate team amount (fixed ₹2500)
const calculateTeamAmount = (mainEvent) => {
  console.log('🧮 Calculating team amount for:', mainEvent);
  return calculateTeamTotal(); // Fixed ₹2500
};

// ... rest of your file remains exactly the same ...
const calculateEventStats = (registrations) => {
  const eventCount = {};
  
  registrations.forEach(reg => {
    // Handle Individual registrations
    if (reg.registrationType === 'individual') {
      // Count prelim events for individuals
      if (reg.prelimEvents && Array.isArray(reg.prelimEvents)) {
        reg.prelimEvents.forEach(event => {
          if (event && event.trim() !== '') {
            eventCount[event] = (eventCount[event] || 0) + 1;
          }
        });
      }
    }
    
    // Handle Team registrations
    if (reg.registrationType === 'team') {
      // Count main events for teams
      if (reg.mainEvent) {
        eventCount[reg.mainEvent] = (eventCount[reg.mainEvent] || 0) + 1;
      }
      
      // Count prelim events from team members
      if (reg.teamMembers && Array.isArray(reg.teamMembers)) {
        reg.teamMembers.forEach(member => {
          if (member.prelimEvents && Array.isArray(member.prelimEvents)) {
            member.prelimEvents.forEach(event => {
              if (event && event.trim() !== '') {
                eventCount[event] = (eventCount[event] || 0) + 1;
              }
            });
          }
        });
      }
      
      // Count prelim events for team leader
      if (reg.teamLeader && reg.teamLeader.prelimEvents && Array.isArray(reg.teamLeader.prelimEvents)) {
        reg.teamLeader.prelimEvents.forEach(event => {
          if (event && event.trim() !== '') {
            eventCount[event] = (eventCount[event] || 0) + 1;
          }
        });
      }
    }
  });
  
  console.log('📊 Event counts:', eventCount);
  return eventCount;
};

const calculateCollegeStats = (registrations) => {
  const collegeCount = {};
  registrations.forEach(reg => {
    let college = 'Unknown College';
    
    if (reg.registrationType === 'individual') {
      college = reg.personalDetails?.college || reg.college || 'Unknown College';
    } else if (reg.registrationType === 'team') {
      college = reg.teamLeader?.college || reg.teamHeadCollege || reg.college || 'Unknown College';
    }
    
    collegeCount[college] = (collegeCount[college] || 0) + 1;
  });
  console.log('🏫 College counts:', collegeCount);
  return collegeCount;
};

const calculatePaymentStats = (registrations) => {
  const paymentCount = { completed: 0, pending: 0, failed: 0 };
  registrations.forEach(reg => {
    const status = (reg.paymentStatus?.toLowerCase() || 'completed');
    if (paymentCount[status] !== undefined) {
      paymentCount[status]++;
    } else {
      paymentCount.completed++;
    }
  });
  console.log('💰 Payment stats:', paymentCount);
  return paymentCount;
};

const calculateDailyStats = (registrations) => {
  const dailyCount = {};
  registrations.forEach(reg => {
    if (reg.registrationDate || reg.registeredAt) {
      const date = (reg.registrationDate || reg.registeredAt).split('T')[0];
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    }
  });
  return dailyCount;
};

// New: Calculate revenue by registration type
const calculateRevenueStats = (registrations) => {
  const revenue = {
    individual: 0,
    team: 0,
    total: 0
  };
  
  registrations.forEach(reg => {
    const amount = parseFloat(reg.totalAmount) || 0;
    
    if (reg.registrationType === 'individual') {
      revenue.individual += amount;
    } else if (reg.registrationType === 'team') {
      revenue.team += amount;
    }
    
    revenue.total += amount;
  });
  
  console.log('💰 Revenue stats:', revenue);
  return revenue;
};

module.exports = {
  calculateIndividualAmount,
  calculateTeamAmount,
  calculateEventStats,
  calculateCollegeStats,
  calculatePaymentStats,
  calculateDailyStats,
  calculateRevenueStats
};