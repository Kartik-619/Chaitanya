const { requiredEnvVars } = require('./constants');

function validateEnvironment() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ MISSING ENVIRONMENT VARIABLES:', missing);
    console.error('Please check your .env file');
    return false;
  }
  
  console.log('✅ All environment variables loaded');
  return true;
}

module.exports = { validateEnvironment };