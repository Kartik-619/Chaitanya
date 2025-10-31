const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * OTP Service - Clean, Professional, Fast
 * Handles OTP generation and email delivery
 */
class OTPService {
    constructor() {
        this.otpStore = new Map(); // Store OTPs temporarily
        this.transporter = null;
        this.initialized = false;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter with connection pooling
     */
    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp-relay.sendinblue.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
                rateDelta: 1000,
                rateLimit: 5,
                connectionTimeout: 5000,
                greetingTimeout: 5000,
                socketTimeout: 10000
            });

            this.initialized = true;
            console.log('✅ OTP Service Initialized');
        } catch (error) {
            console.error('❌ OTP Service initialization failed:', error);
            this.initialized = false;
        }
    }

    /**
     * Generate 6-digit OTP
     */
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Store OTP with expiry (10 minutes)
     */
    storeOTP(email, phone, otp) {
        const key = `${email}-${phone}`;
        const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        this.otpStore.set(key, {
            otp,
            createdAt: Date.now(),
            expiresAt: expiryTime
        });

        // Auto-cleanup after expiry
        setTimeout(() => {
            this.otpStore.delete(key);
        }, 10 * 60 * 1000);
    }

    /**
     * Verify OTP
     */
    verifyOTP(email, phone, enteredOTP) {
        const key = `${email}-${phone}`;
        const stored = this.otpStore.get(key);

        if (!stored) {
            return { valid: false, message: 'OTP not found or expired' };
        }

        if (Date.now() > stored.expiresAt) {
            this.otpStore.delete(key);
            return { valid: false, message: 'OTP expired' };
        }

        if (stored.otp !== enteredOTP) {
            return { valid: false, message: 'Invalid OTP' };
        }

        // OTP is valid, remove it
        this.otpStore.delete(key);
        return { valid: true, message: 'OTP verified successfully' };
    }

    /**
     * Generate clean HTML email template
     */
    generateEmailHTML(otp) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chaitanya 2025 - OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #8B0000; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Chaitanya 2025 - OTP Verification</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Himachal Pradesh Technical University</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear Participant,</p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Your One-Time Password (OTP) for Chaitanya 2025 registration is:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #f8f8f8; border: 2px solid #8B0000; border-radius: 8px; padding: 20px; display: inline-block;">
                                            <p style="color: #8B0000; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 14px; text-align: center; margin: 20px 0;">
                                This OTP is valid for <strong>10 minutes</strong>
                            </p>
                            
                            <!-- Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;">
                                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                                            <strong>Security Notice:</strong> Do not share this OTP with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                If you didn't request this OTP, please ignore this email.
                            </p>
                            
                            <p style="color: #666666; font-size: 14px; margin: 20px 0 0 0;">
                                <strong>Contact:</strong> <a href="mailto:chaitanyahptu@gmail.com" style="color: #8B0000; text-decoration: none;">chaitanyahptu@gmail.com</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 30px; border-top: 1px solid #dddddd;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                                Best regards,<br>
                                <strong>Chaitanya 2025 Team</strong><br>
                                Himachal Pradesh Technical University
                            </p>
                            
                            <!-- Event Address -->
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dddddd;">
                                <p style="color: #666666; font-size: 13px; margin: 0; line-height: 1.6;">
                                    <strong>Event Address:</strong><br>
                                    Chaitanya 2025, HPTU<br>
                                    Gandhi Chowk, Hamirpur<br>
                                    Himachal Pradesh 177001
                                </p>
                            </div>
                            
                            <!-- Contact Support -->
                            <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 6px; border: 1px solid #dddddd;">
                                <p style="color: #333333; font-size: 14px; margin: 0; font-weight: bold;">Contact Support</p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    /**
     * Generate and send OTP (main method called by controllers)
     */
    async generateAndSendOTP(email, phone) {
        try {
            // Generate OTP
            const otp = this.generateOTP();
            
            // Store OTP
            this.storeOTP(email, phone, otp);
            
            console.log(`🔐 Generated OTP for ${email}: ${otp}`);

            // Check if transporter is initialized
            if (!this.initialized || !this.transporter) {
                console.warn('⚠️ Email service not initialized, OTP generated but not sent');
                return {
                    success: true,
                    otp,
                    message: 'OTP generated (email service unavailable)',
                    emailSent: false
                };
            }

            // Email options
            const mailOptions = {
                from: {
                    name: 'Chaitanya 2025 - HPTU',
                    address: process.env.EMAIL_FROM
                },
                to: email,
                subject: 'Your OTP Code - Chaitanya 2025 Registration',
                html: this.generateEmailHTML(otp),
                headers: {
                    'X-Priority': '1',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'high',
                    'Content-Type': 'text/html; charset=UTF-8'
                }
            };

            // Send email
            const startTime = Date.now();
            await this.transporter.sendMail(mailOptions);
            const deliveryTime = Date.now() - startTime;

            console.log(`✅ OTP email sent to ${email} in ${deliveryTime}ms`);

            return {
                success: true,
                otp,
                message: 'OTP sent successfully',
                emailSent: true,
                deliveryTime
            };

        } catch (error) {
            console.error('❌ Error sending OTP email:', error);
            
            // Still return success with OTP (fallback mode)
            const otp = this.generateOTP();
            this.storeOTP(email, phone, otp);
            
            return {
                success: true,
                otp,
                message: 'OTP generated (email delivery failed)',
                emailSent: false,
                error: error.message
            };
        }
    }

    /**
     * Cleanup expired OTPs
     */
    cleanupExpiredOTPs() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of this.otpStore.entries()) {
            if (now > value.expiresAt) {
                this.otpStore.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
        }
    }
}

// Export singleton instance
module.exports = new OTPService();
