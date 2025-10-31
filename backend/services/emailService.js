const nodemailer = require('nodemailer');

/**
 * Email Service - Professional, Clean, Fast
 * Handles all email communications for Chaitanya 2025
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.dailyEmailCount = 0;
    this.lastResetDate = new Date().toDateString();
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
        rateLimit: 5
      });

      this.initialized = true;
      console.log('✅ Email Service Initialized');
    } catch (error) {
      console.error('❌ Email Service initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Reset daily email counter
   */
  resetDailyCounter() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyEmailCount = 0;
      this.lastResetDate = today;
    }
  }

  /**
   * Generate professional confirmation email HTML
   */
  generateConfirmationHTML(registrationData, name) {
    const { registrationId, registrationType, totalAmount } = registrationData;
    
    // Build event list
    let eventsHTML = '';
    if (registrationData.prelimEvents && registrationData.prelimEvents.length > 0) {
      eventsHTML = registrationData.prelimEvents.map(event => 
        `<li style="color: #5a6c7d; font-size: 14px; margin: 5px 0;">• ${event}</li>`
      ).join('');
    } else if (registrationData.mainEvent) {
      eventsHTML = `<li style="color: #5a6c7d; font-size: 14px; margin: 5px 0;">• ${registrationData.mainEvent}</li>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmed - Chaitanya 2025</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #28a745; padding: 40px 30px; text-align: center;">
                            <div style="font-size: 50px; margin-bottom: 10px;">🎉</div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Registration Confirmed!</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Chaitanya 2025 - HPTU Technical Festival</p>
                            <div style="margin-top: 15px;">
                                <span style="background-color: rgba(255,255,255,0.3); color: #fff; padding: 8px 20px; border-radius: 25px; font-size: 13px; font-weight: 600; display: inline-block;">✅ SUCCESSFULLY REGISTERED</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">Dear ${name},</h2>
                            <p style="color: #5a6c7d; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                We're thrilled to confirm that your registration for <strong style="color: #8B0000;">Chaitanya 2025</strong> has been successfully completed! Get ready for an amazing experience.
                            </p>
                            
                            <!-- Registration Details -->
                            <div style="background-color: #fff5f5; border-left: 4px solid #8B0000; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #8B0000; margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">📋 Registration Details</h3>
                                <table width="100%" cellpadding="8" cellspacing="0" border="0">
                                    <tr>
                                        <td style="color: #5a6c7d; font-size: 14px; font-weight: 600;">Registration ID:</td>
                                        <td style="text-align: right;">
                                            <code style="background: #fff; padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace; color: #8B0000; font-weight: 700; font-size: 13px; border: 1px solid #ffcccb;">${registrationId}</code>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #5a6c7d; font-size: 14px; font-weight: 600;">Type:</td>
                                        <td style="text-align: right; color: #2c3e50; font-weight: 600; font-size: 14px;">${registrationType === 'individual' ? '👤 Individual' : '👥 Team'}</td>
                                    </tr>
                                </table>
                                ${eventsHTML ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(139,0,0,0.2);"><p style="color: #5a6c7d; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">Selected Events:</p><ul style="margin: 0; padding-left: 20px;">${eventsHTML}</ul></div>` : ''}
                            </div>

                            <!-- ID Card Notice -->
                            <div style="background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h4 style="color: #155724; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">🎫 Your ID Card is Coming!</h4>
                                <p style="color: #155724; margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;">
                                    <strong>Your official event ID card will be sent to your email within 48 hours.</strong>
                                </p>
                                <p style="color: #155724; margin: 0; font-size: 13px; line-height: 1.5;">
                                    Please check your inbox (and spam folder) for the ID card email. Bring your ID card to the event!
                                </p>
                            </div>

                            <!-- Payment Summary -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">💰 Payment Summary</h4>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="color: #856404; font-size: 14px; font-weight: 600;">Total Amount Paid:</td>
                                        <td style="text-align: right; color: #856404; font-size: 20px; font-weight: 800;">₹${totalAmount || 0}</td>
                                    </tr>
                                </table>
                                <p style="color: #856404; margin: 10px 0 0 0; font-size: 12px;">
                                    <span style="background: #fff; padding: 4px 10px; border-radius: 12px; display: inline-block;">Payment Status: <strong style="color: #28a745;">Completed ✅</strong></span>
                                </p>
                            </div>

                            <!-- Contact Support -->
                            <div style="background-color: #e7f3ff; border-left: 4px solid #0056b3; border-radius: 8px; padding: 18px; margin: 25px 0;">
                                <h4 style="color: #0056b3; margin: 0 0 8px 0; font-size: 14px; font-weight: 700;">📧 Need Assistance?</h4>
                                <p style="color: #0056b3; margin: 0 0 6px 0; font-size: 13px;">
                                    If you don't receive your ID card within 48 hours or have any questions:
                                </p>
                                <p style="margin: 0;">
                                    <a href="mailto:chaitanyahptu@gmail.com" style="color: #8B0000; text-decoration: none; font-weight: 700; font-size: 14px;">chaitanyahptu@gmail.com</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 30px; border-top: 1px solid #dddddd; text-align: center;">
                            <p style="color: #666666; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">
                                Best regards,<br>
                                <strong style="color: #8B0000;">The Chaitanya 2025 Team</strong><br>
                                <span style="color: #5a6c7d;">Himachal Pradesh Technical University</span>
                            </p>
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dddddd;">
                                <p style="color: #999999; margin: 0; font-size: 12px; line-height: 1.6;">
                                    <strong>Official Address:</strong><br>
                                    Chaitanya 2025 Technical Festival<br>
                                    Himachal Pradesh Technical University<br>
                                    Gandhi Chowk, Hamirpur, HP 177001<br>
                                    <a href="mailto:chaitanyahptu@gmail.com" style="color: #8B0000; text-decoration: none;">Email Support</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Bottom Bar -->
                    <tr>
                        <td style="background-color: #333333; padding: 20px; text-align: center;">
                            <p style="color: #999999; margin: 0; font-size: 11px; line-height: 1.5;">
                                © 2025 Chaitanya - HPTU. All rights reserved.<br>
                                This is an automated confirmation message.
                            </p>
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
   * Send confirmation email
   */
  async sendConfirmation(email, registrationData, name) {
    try {
      // Reset daily counter if needed
      this.resetDailyCounter();

      // Check daily limit
      if (this.dailyEmailCount >= 300) {
        console.warn('⚠️ Daily email limit reached');
        return { success: true, rateLimited: true };
      }

      if (!this.initialized || !this.transporter) {
        console.warn('⚠️ Email service not initialized');
        return { success: true, emailSent: false };
      }

      const mailOptions = {
        to: email,
        from: {
          name: 'Chaitanya 2025 - HPTU',
          address: process.env.EMAIL_FROM || 'chaitanyahptu@gmail.com'
        },
        replyTo: process.env.EMAIL_FROM || 'chaitanyahptu@gmail.com',
        subject: 'Registration Confirmed - Chaitanya 2025',
        html: this.generateConfirmationHTML(registrationData, name),
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'Content-Type': 'text/html; charset=UTF-8'
        }
      };

      const startTime = Date.now();
      await this.transporter.sendMail(mailOptions);
      const deliveryTime = Date.now() - startTime;

      this.dailyEmailCount++;
      console.log(`✅ Confirmation email sent to ${email} in ${deliveryTime}ms`);

      return {
        success: true,
        emailSent: true,
        deliveryTime
      };

    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return {
        success: true,
        emailSent: false,
        error: error.message
      };
    }
  }

  /**
   * Send individual confirmation
   */
  async sendIndividualConfirmation(registrationData) {
    const email = registrationData.personalDetails?.email;
    const name = registrationData.personalDetails?.name;

    if (!email || !name) {
      console.error('❌ Missing email or name for confirmation');
      return { success: false, message: 'Missing email or name' };
    }

    return await this.sendConfirmation(email, registrationData, name);
  }

  /**
   * Send team confirmation
   */
  async sendTeamConfirmation(registrationData) {
    const email = registrationData.teamHead?.email;
    const name = registrationData.teamHead?.name;

    if (!email || !name) {
      console.error('❌ Missing email or name for team confirmation');
      return { success: false, message: 'Missing email or name' };
    }

    return await this.sendConfirmation(email, registrationData, name);
  }
}

// Export singleton instance
module.exports = new EmailService();
