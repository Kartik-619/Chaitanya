const { Resend } = require('resend');
const { SESSION_CONFIG } = require('../config/constants');

class OTPService {
  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.initialized = true;
      console.log('✅ Resend OTP Service Initialized');
    } else {
      this.initialized = false;
      console.warn('❌ Resend API key not found. OTP emails will not be sent.');
    }
  }

  /**
   * Generate random 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via email using Resend API
   */
  async sendOTPEmail(email, otp) {
    if (!this.initialized) {
      console.log(`📧 [SIMULATED] OTP ${otp} for ${email}`);
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Chaitanya 2025 <onboarding@resend.dev>',
        to: email,
        subject: 'Your OTP for Chaitanya 2025 Registration',
        html: this.generateOTPEmailHTML(otp),
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return false;
      }

      console.log(`✅ OTP email sent via Resend to ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Resend failed:', error);
      return false;
    }
  }

  /**
   * Send OTP via SMS (placeholder for SMS service integration)
   */
  async sendOTPSMS(phone, otp) {
    try {
      // Placeholder for SMS integration
      console.log(`📱 SMS OTP for ${phone}: ${otp}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP SMS:', error);
      return false;
    }
  }

  /**
   * Generate and send OTP via both email and SMS
   */
  async generateAndSendOTP(email, phone) {
    try {
      const otp = this.generateOTP();
      
      console.log(`🔐 Generated OTP for ${email}: ${otp}`);
      
      // Send OTP via email
      const emailSent = await this.sendOTPEmail(email, otp);
      
      // Send OTP via SMS (optional)
      const smsSent = await this.sendOTPSMS(phone, otp);
      
      if (emailSent) {
        return {
          success: true,
          otp: otp,
          message: 'OTP sent successfully to your email'
        };
      } else {
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('❌ Error in generateAndSendOTP:', error);
      return {
        success: false,
        message: 'Error sending OTP. Please try again.'
      };
    }
  }

  /**
   * Generate professional OTP email HTML template
   */
  generateOTPEmailHTML(otp) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
        .header { background: #8B0000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
        .otp-box { background: #ffffff; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #8B0000; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B0000; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Chaitanya 2025 - OTP Verification</h1>
        <p>Himachal Pradesh Technical University</p>
    </div>
    
    <div class="content">
        <p>Dear Participant,</p>
        
        <p>Your One-Time Password (OTP) for Chaitanya 2025 registration is:</p>
        
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for 10 minutes</p>
        </div>

        <div class="warning">
            <strong>⚠️ Security Notice:</strong> Do not share this OTP with anyone.
        </div>

        <p>If you didn't request this OTP, please ignore this email.</p>

        <div class="footer">
            <p><strong>Contact:</strong> chaitanyahptu@gmail.com</p>
            <p>Best regards,<br>
            <strong>Chaitanya 2025 Team</strong><br>
            Himachal Pradesh Technical University</p>
        </div>
    </div>
</body>
</html>
`;
  }

  /**
   * Verify OTP validity and expiry
   */
  verifyOTP(storedOTP, enteredOTP, otpCreatedAt) {
    const now = Date.now();
    
    // Check OTP expiry
    if (now - otpCreatedAt > SESSION_CONFIG.OTP_EXPIRY) {
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }
    
    // Check OTP match
    if (storedOTP !== enteredOTP) {
      return { valid: false, message: 'Invalid OTP. Please try again.' };
    }
    
    return { valid: true, message: 'OTP verified successfully' };
  }
}

// Export service instance
module.exports = new OTPService();
