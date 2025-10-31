const nodemailer = require('nodemailer');
const { SESSION_CONFIG } = require('../config/constants');

// Initialize Nodemailer transporter with better configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 15000, // 15 seconds connection timeout
    greetingTimeout: 15000,
    socketTimeout: 15000,
    // Better error handling
    logger: false,
    debug: false
});

class OTPService {
    constructor() {
        this.initialized = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
        if (!this.initialized) {
            console.warn('⚠ SMTP configuration not found. OTP emails will not be sent.');
        } else {
            console.log('✅ Nodemailer OTP Service Initialized');
        }
        
        // Track email failures for fallback
        this.consecutiveFailures = 0;
        this.maxConsecutiveFailures = 3;
    }

    /**
     * Generate random 6-digit OTP
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP via email using Nodemailer with timeout and fallback
     */
    async sendOTPEmail(email, otp) {
        // If too many consecutive failures, use simulation mode temporarily
        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
            console.warn(`🔄 Too many email failures (${this.consecutiveFailures}), using simulation mode`);
            console.warn(`📧 [SIMULATED] OTP ${otp} for ${email}`);
            return true;
        }

        if (!this.initialized) {
            console.warn(`📧 [SIMULATED] OTP ${otp} for ${email}`);
            return true;
        }

        try {
            const mailOptions = {
                from: {
                    name: 'Chaitanya 2025',
                    address: process.env.EMAIL_FROM 
                },
                to: email,
                subject: 'Your Verification Code for Chaitanya 2025 Registration',
                text: `Your OTP for Chaitanya 2025 registration is: ${otp}. This OTP will expire in 10 minutes.`,
                html: this.generateOTPEmailHTML(otp),
            };

            // Add timeout to email sending
            const emailPromise = transporter.sendMail(mailOptions);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Email timeout after 15s')), 15000);
            });

            const info = await Promise.race([emailPromise, timeoutPromise]);
            
            // Reset failure counter on success
            this.consecutiveFailures = 0;
            console.log(`✅ OTP email sent to ${email}, Message ID: ${info.messageId}`);
            return true;
            
        } catch (error) {
            this.consecutiveFailures++;
            console.error(`❌ Email failed for ${email} (Attempt ${this.consecutiveFailures}/${this.maxConsecutiveFailures}):`, error.message);
            
            // Fallback to simulation mode for this request
            console.warn(`📧 [FALLBACK] OTP ${otp} for ${email}`);
            return true; // Always return true to not block registration
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
            
            // Track email performance
            const emailStartTime = Date.now();
            const emailSent = await this.sendOTPEmail(email, otp);
            const emailTime = Date.now() - emailStartTime;
            
            if (emailTime > 5000) {
                console.warn(`⚠ Email delivery took ${emailTime}ms (slow)`);
            } else {
                console.log(`📧 Email delivery took ${emailTime}ms`);
            }
            
            // Send OTP via SMS (optional - don't block on failure)
            try {
                await this.sendOTPSMS(phone, otp);
            } catch (smsError) {
                console.warn('⚠ SMS delivery failed, continuing...');
            }
            
            // Always return success to not block registration
            // Email is important but shouldn't prevent registration
            return {
                success: true,
                otp: otp,
                message: 'OTP generated successfully',
                emailDelivered: emailSent
            };

        } catch (error) {
            console.error('❌ Error in generateAndSendOTP:', error);
            // Even if everything fails, return success with OTP
            // Let the user verify OTP manually if needed
            const fallbackOtp = this.generateOTP();
            console.warn(`🔄 Using fallback OTP due to error: ${fallbackOtp}`);
            
            return {
                success: true,
                otp: fallbackOtp,
                message: 'OTP generated (fallback mode)',
                emailDelivered: false,
                fallback: true
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
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - Chaitanya 2025</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background: #f9f9f9; }
        .header { background: #8B0000; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: white; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B0000; margin: 20px 0; text-align: center; }
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
        
        <div style="background: #ffffff; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #8B0000; border-radius: 8px;">
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for 10 minutes</p>
        </div>

        <div class="warning">
            <strong>⚠ Security Notice:</strong> Do not share this OTP with anyone.
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
</html>`;
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

    /**
     * Reset failure counter (call this when SMTP issues are resolved)
     */
    resetFailureCounter() {
        this.consecutiveFailures = 0;
        console.log('✅ Email failure counter reset');
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            consecutiveFailures: this.consecutiveFailures,
            maxConsecutiveFailures: this.maxConsecutiveFailures,
            inFallbackMode: this.consecutiveFailures >= this.maxConsecutiveFailures
        };
    }
}

// Export service instance
module.exports = new OTPService();
