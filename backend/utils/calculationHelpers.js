/**
 * 🧮 CALCULATION HELPERS
 * 
 * This file contains all calculation and statistics functions:
 * - Calculate registration amounts for individuals and teams
 * - Generate statistics for admin dashboard
 * - Count events, colleges, payments, and revenue
 * 
 * 📊 WHAT IT DOES:
 * - Money calculations for registrations
 * - Statistical analysis of registration data
 * - Dashboard reporting functions
 */

const { EVENT_PRICES, calculateTeamTotal } = require('../config/eventPricing');
const { EVENT_CONFIG } = require('../config/constants');

/**
 * Calculate individual registration amount with premium and accommodation
 * @param {Array} prelimEvents - List of events selected by individual
 * @param {boolean} isPremium - Whether premium package is selected
 * @param {boolean} needsAccommodation - Whether accommodation is needed
 * @returns {number} Total amount to pay
 */
const calculateIndividualAmount = (prelimEvents, isPremium = false, needsAccommodation = false) => {
  console.log('🧮 Calculating individual amount - NEW PRICING');
  
  const baseAmount = calculateIndividualTotal(prelimEvents);
  let total = baseAmount;
  
  // COMPULSORY food fee - ₹400 per person
  total += 400;
  console.log('💰 Added compulsory food fee: 400');
  
  // OPTIONAL accommodation - ₹200 per person
  if (needsAccommodation) {
    total += 200;
    console.log('💰 Added optional accommodation: 200');
  }
  
  // Premium fee
  if (isPremium) {
    total += EVENT_CONFIG.PREMIUM_FEE;
  }
  
  return total;
};

/**
 * Calculate team registration amount with accommodation AND PREMIUM
 */

  const calculateTeamAmount = (mainEvent, teamSize, needsAccommodation = false, esportsGame = null, isPremium = false) => {
  console.log('🧮 Calculating team amount - NEW PRICING');
  
  const baseAmount = calculateTeamTotal(mainEvent, teamSize, esportsGame);
  let total = baseAmount;
  
  // COMPULSORY food for all team members
  total += 400 * teamSize;
  console.log('💰 Added compulsory food for', teamSize, 'members:', 400 * teamSize);
  
  // OPTIONAL accommodation for all team members
  if (needsAccommodation) {
    total += 200 * teamSize;
    console.log('💰 Added optional accommodation for', teamSize, 'members:', 200 * teamSize);
  }
  
  // Premium fee
  if (isPremium) {
    total += 200;
  }
  
  return total;
};

/**
 * Calculate individual total from event pricing config
 * @param {Array} prelimEvents - List of events
 * @returns {number} Total event amount
 */
const calculateIndividualTotal = (prelimEvents) => {
  console.log('🧮 Calculating individual total for events:', prelimEvents);
  
  if (!prelimEvents || !Array.isArray(prelimEvents)) {
    console.log('❌ Invalid events array');
    return 0;
  }
  
  const total = prelimEvents.reduce((sum, event) => {
    const price = EVENT_PRICES[event] || 0;
    console.log(`   - ${event}: ₹${price}`);
    return sum + price;
  }, 0);
  
  console.log('💰 Individual events total:', total);
  return total;
};

// Existing functions (keep for backward compatibility)
const calculateEventStats = (registrations) => {
  const eventCount = {};
  
  registrations.forEach(reg => {
    if (reg.registrationType === 'individual' && reg.prelimEvents) {
      reg.prelimEvents.forEach(event => {
        if (event && event.trim() !== '') {
          eventCount[event] = (eventCount[event] || 0) + 1;
        }
      });
    }
    
    if (reg.registrationType === 'team' && reg.mainEvent) {
      eventCount[reg.mainEvent] = (eventCount[reg.mainEvent] || 0) + 1;
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

// Export all calculation functions
module.exports = {
  calculateIndividualAmount,
  calculateTeamAmount,
  calculateIndividualTotal,
  calculateEventStats,
  calculateCollegeStats,
  calculatePaymentStats,
  calculateDailyStats,
  calculateRevenueStats
};
