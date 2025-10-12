const EVENT_PRICES = {
  // Main Events - ₹2500 each (for teams)
  "Hackathon": 2500,
  "Accurate Predictions": 2500,
  
  // Prelim Events - Individual Prices (for individual participants)
  "Code Forge": 200,
  "Robo Rampage": 200,
  "Integration Bee": 150,
  "Encryption/Decryption": 150,
  "Reverse Engineering": 200,
  "Bug Bounty / CTF": 300,
  "Data Analysis Challenge": 250,
  "Stock Prediction": 200,
  "Sports Analytics": 150,

  // Prelim Events - Free (for team members)
  "Code Forge_team": 0,
  "Robo Rampage_team": 0,
  "Integration Bee_team": 0,
  "Encryption/Decryption_team": 0,
  "Reverse Engineering_team": 0,
  "Bug Bounty / CTF_team": 0,
  "Data Analysis Challenge_team": 0,
  "Stock Prediction_team": 0,
  "Sports Analytics_team": 0
};

// Helper function to get price based on registration type
function getEventPrice(eventName, isTeamMember = false) {
  if (isTeamMember) {
    return EVENT_PRICES[`${eventName}_team`] || 0;
  }
  return EVENT_PRICES[eventName] || 0;
}

// ✅ FIXED: Function name matches what calculationHelpers expects
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

// ✅ FIXED: Function name matches what calculationHelpers expects  
function calculateTeamTotal() {
  return 2500; // Fixed ₹2500 for team registration
}

module.exports = { 
  EVENT_PRICES, 
  getEventPrice, 
  calculateIndividualTotal,  // ✅ Correct name
  calculateTeamTotal         // ✅ Correct name
};