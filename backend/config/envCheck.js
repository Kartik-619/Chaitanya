/**
 * 🔍 ENVIRONMENT VALIDATION
 * 
 * This file checks if all required passwords and keys are set up correctly
 * - Makes sure the app has everything it needs to run
 * - Shows clear error messages if something is missing
 */

// Get the list of required environment variables from constants file
const { requiredEnvVars } = require('./constants');

/**
 * Check if all required environment variables are set
 * @returns {boolean} true if all variables are present, false if any are missing
 */
function validateEnvironment() {
  // Find which environment variables are missing
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  // If any variables are missing, show error and stop
  if (missing.length > 0) {
    console.error('❌ MISSING ENVIRONMENT VARIABLES:', missing);
    console.error('Please check your .env file');
    return false;
  }
  
  // If everything is good, continue
  console.log('✅ All environment variables loaded');
  return true;
}

// Make this function available to other files
module.exports = { validateEnvironment };