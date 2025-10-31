/**
 * API Configuration for Techfest Frontend
 * Centralized API URL management
 */

// Use environment variable or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Registration
  REGISTER_START: `${API_BASE_URL}/api/register/start`,
  VERIFY_OTP: `${API_BASE_URL}/api/register/verify-otp`,
  SETUP_INDIVIDUAL: `${API_BASE_URL}/api/register/setup-individual`,
  SETUP_TEAM: `${API_BASE_URL}/api/register/setup-team`,
  REVIEW: `${API_BASE_URL}/api/register/review`,
  
  // Payment
  VERIFY_PAYMENT: `${API_BASE_URL}/api/payment/verify-payment`,
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
};

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: import.meta.env.MODE
  });
}

export default API_ENDPOINTS;
