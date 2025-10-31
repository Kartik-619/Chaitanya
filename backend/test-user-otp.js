/**
 * Test script to verify OTP is sent to user's email
 */

require('dotenv').config();
const OTPService = require('./services/otpService');

// Test with a real email address
const testEmail = process.argv[2] || 'chaitanyahptu@gmail.com';
const testPhone = '9876543210';

console.log('🧪 Testing OTP Email Delivery');
console.log('━'.repeat(50));
console.log(`📧 Sending OTP to: ${testEmail}`);
console.log(`📱 Phone: ${testPhone}`);
console.log('━'.repeat(50));
console.log('');

async function testOTP() {
  try {
    const startTime = Date.now();
    
    // Generate and send OTP
    const result = await OTPService.generateAndSendOTP(testEmail, testPhone);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('');
    console.log('━'.repeat(50));
    console.log('📊 RESULTS:');
    console.log('━'.repeat(50));
    console.log(`✅ Success: ${result.success}`);
    console.log(`🔐 OTP Generated: ${result.otp}`);
    console.log(`📧 Email Delivered: ${result.emailDelivered}`);
    console.log(`⏱️  Delivery Time: ${duration}ms`);
    console.log(`🎯 Target: <5000ms`);
    console.log('');
    
    if (duration < 5000) {
      console.log('✅ PASS: OTP delivered within target time!');
    } else {
      console.log('⚠️  SLOW: OTP took longer than 5 seconds');
    }
    
    console.log('');
    console.log('━'.repeat(50));
    console.log('📬 CHECK YOUR EMAIL INBOX:');
    console.log('━'.repeat(50));
    console.log(`Email: ${testEmail}`);
    console.log(`Subject: "Your OTP Code - Chaitanya 2025 Registration"`);
    console.log(`OTP Code: ${result.otp}`);
    console.log('');
    console.log('If you don\'t see it in inbox, check spam folder!');
    console.log('━'.repeat(50));
    
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('━'.repeat(50));
    console.error('❌ ERROR:');
    console.error('━'.repeat(50));
    console.error(error.message);
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
testOTP();
