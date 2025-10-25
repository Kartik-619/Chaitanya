/**
 * 💰 EVENT PRICING AND CALCULATIONS
 * 
 * This file handles all money-related calculations for events:
 * - Prices for different events
 * - Calculations for individual participants
 * - Calculations for team registrations
 */

// Prices for all events
const EVENT_PRICES = {
  // ==================== INDIVIDUAL EVENTS ====================
  "Integration Bee": 99,
  "Human vs AI": 99,
  "Retro Theming": 99,
  "Prompt Engineering": 99,
  "Reverse Engineering": 99,
  "Jack of Hearts": 99,
  "Singing": 99,
  "Dancing": 99,
  "Project Bazaar" : 0,

  // ==================== TEAM EVENTS ====================
  // Per-person pricing
  "Singing_team": 99,
  "Dance_team": 99,
  "Reverse Engineering_team": 99,
  "Retro Theming_team": 99,
  "Debate_team": 99,
  "Two Minute Manager_team": 99,

  // Base + additional pricing
  "Hackathon_team": 199,
  "Accurate Prediction_team": 199,
  "Polymath_team": 149,
  
  // Fixed pricing
  "E-sports_team": 149
};

/**
 * Get the price for an event based on registration type
 * @param {string} eventName - Name of the event
 * @param {boolean} isTeamMember - Whether the person is part of a team
 * @returns {number} Price for the event
 */
function getEventPrice(eventName, isTeamMember = false) {
  // If person is in a team, check for team price
  if (isTeamMember) {
    return EVENT_PRICES[`${eventName}_team`] || 0;
  }
  // If person is individual, get normal price
  return EVENT_PRICES[eventName] || 0;
}

/**
 * Calculate total amount for individual participant
 * @param {Array} prelimEvents - List of events the person selected
 * @returns {number} Total amount to pay
 */
function calculateIndividualTotal(prelimEvents) {
  console.log('🔢 Calculating individual total for events:', prelimEvents);
  
  if (!prelimEvents || !Array.isArray(prelimEvents)) {
    console.log('❌ Invalid events array:', prelimEvents);
    return 0;
  }
  
  const total = prelimEvents.reduce((sum, event) => {
    const price = EVENT_PRICES[event] || 0;
    console.log(`   - ${event}: ₹${price}`);
    return sum + price;
  }, 0);
  
  console.log('💰 Total calculated:', total);
  return total;
}

/**
 * Calculate total amount for team registration
 * @param {string} mainEvent - Main team event
 * @param {number} teamSize - Number of team members
 * @param {string} esportsGame - Selected game for E-sports
 * @returns {number} Total team amount
 */
function calculateTeamTotal(mainEvent, teamSize, esportsGame = null) {
  console.log('🔢 Calculating team total:', { mainEvent, teamSize, esportsGame });
  
  const basePrice = EVENT_PRICES[`${mainEvent}_team`] || 0;
  let total = 0;

  // Handle different pricing models
  switch (mainEvent) {
    case 'Hackathon':
      // ₹999 for 3 people + ₹249 per additional person
      total = basePrice + Math.max(0, (teamSize - 3) * 249);
      break;
      
    case 'Accurate Prediction':
      // ₹999 for 2 people + ₹249 per additional person
      total = basePrice + Math.max(0, (teamSize - 2) * 249);
      break;
      
    case 'Polymath':
      // ₹499 for 2 people + ₹249 per additional person
      total = basePrice + Math.max(0, (teamSize - 2) * 249);
      break;
      
    case 'E-sports':
      // Fixed ₹999 regardless of team size (4 members fixed)
      total = basePrice;
      break;
      
    default:
      // Per-person pricing for other events
      total = basePrice * teamSize;
  }
  
  console.log('💰 Team total calculated:', total);
  return total;
}

// Make these available to other files
module.exports = { 
  EVENT_PRICES, 
  getEventPrice, 
  calculateIndividualTotal,  
  calculateTeamTotal         
};
