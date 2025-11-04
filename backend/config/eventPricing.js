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
  "Integration Bee": 0,
  "Human vs AI": 0,
  "Retro Theming": 0,
  "Prompt Engineering": 0,
  "Reverse Engineering": 0,
  "Jack of Hearts": 0,
  "Singing": 0,
  "Dancing": 0,
  "Project Bazaar": 0,

  // ==================== TEAM EVENTS ====================
  // Per-person pricing
  "Singing_team": 0,
  "Dance_team": 0,
  "Debate_team": 0,
  "Two Minute Manager_team": 0,

  // Base + additional pricing
  "Hackathon_team": 0,
  "Accurate Prediction_team": 0,
  "Polymath_team": 0,
  "Capture The Flag": 0,
  "Pitch High": 0,
  
  // Fixed pricing
  "E-sports_team": 0
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
      // CHANGE THIS: from complex calculation to simple per-person
      total = basePrice * teamSize; // 199 × teamSize
      break;
      
    case 'Accurate Prediction':
      // CHANGE THIS
      total = basePrice * teamSize; // 199 × teamSize
      break;
      
    case 'Polymath':
      // CHANGE THIS  
      total = basePrice * teamSize; // 149 × teamSize
      break;
      
    case 'E-sports':
      // CHANGE THIS
      total = basePrice * teamSize; // 149 × 4 (fixed 4 members)
      break;
      
    default:
      total = basePrice * teamSize;
  }
  
  return total;
}

// Make these available to other files
module.exports = { 
  EVENT_PRICES, 
  getEventPrice, 
  calculateIndividualTotal,  
  calculateTeamTotal         
};
