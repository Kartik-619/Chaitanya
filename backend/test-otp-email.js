/**
 * Test OTP Email Sending
 */

require('dotenv').config();
const OTPService = require('./services/otpService');

async function testOTPEmail() {
  console.log('🧪 Testing OTP Email Service...\n');
  
  // Test email (replace with your email)
  const testEmail = 'vishavkaundal2005@gmail.com';
  const testPhone = '9876543210';
  
  console.log(`📧 Sending OTP to: ${testEmail}`);
  console.log(`📱 Phone: ${testPhone}\n`);
  
  try {
    const result = await OTPService.generateAndSendOTP(testEmail, testPhone);
    
    console.log('\n✅ RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.emailSent) {
      console.log('\n✅ OTP EMAIL SENT SUCCESSFULLY!');
      console.log(`📧 Check your inbox: ${testEmail}`);
      console.log(`🔐 OTP: ${result.otp} (for testing)`);
    } else if (result.success && !result.emailSent) {
      console.log('\n⚠️ OTP GENERATED BUT EMAIL NOT SENT');
      console.log('Email service may not be initialized');
      console.log(`🔐 OTP: ${result.otp} (for testing)`);
    } else {
      console.log('\n❌ FAILED TO SEND OTP');
      console.log('Error:', result.message);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    
    // Check common issues
    console.log('\n🔍 TROUBLESHOOTING:');
    
    if (error.message.includes('SMTP')) {
      console.log('❌ SMTP Configuration Issue');
      console.log('Check your .env file:');
      console.log('  - SMTP_HOST');
      console.log('  - SMTP_PORT');
      console.log('  - SMTP_USER');
      console.log('  - SMTP_PASS');
    }
    
    if (error.message.includes('authentication')) {
      console.log('❌ Authentication Failed');
      console.log('Check SMTP_USER and SMTP_PASS in .env');
    }
    
    if (error.message.includes('timeout')) {
      console.log('❌ Connection Timeout');
      console.log('Check your internet connection');
    }
  }
  
  process.exit(0);
}

testOTPEmail();
