const nodemailer = require('nodemailer');
const { EMAIL_CONFIG, ID_CONFIG } = require('../config/emailConfig');

class EmailService {
  constructor() {
    // Initialize Nodemailer transporter with OPTIMIZED connection pooling and rate limiting
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // 🚀 OPTIMIZED CONNECTION POOLING for high traffic
      pool: true,               // Enable connection pooling
      maxConnections: 20,       // Increased from 5 to 20 for better concurrency
      maxMessages: 100,         // Messages per connection
      rateDelta: 1000,          // 1 second between batches
      rateLimit: 15,            // 15 emails per second
      
      // ⚡ SPEED OPTIMIZATIONS
      connectionTimeout: 5000,  // 5 seconds
      greetingTimeout: 5000,
      socketTimeout: 5000,
      
      // 📧 DELIVERABILITY
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    });

    this.initialized = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  
    if (!this.initialized) {
      console.warn('⚠ SMTP configuration not found. Registration emails will not be sent.');
    } else {
      console.log('✅ Nodemailer Email Service Initialized');
    }

    // Rate limiting system
    this.dailyEmailCount = 0;              // Track emails sent today
    
    // Reset daily counter every 24 hours
    setInterval(() => {
      this.dailyEmailCount = 0;
      console.log('📧 Daily email counter reset to 0');
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    this.MAX_EMAILS_PER_DAY = 90;          

    // Event pricing for amount calculations
    this.eventPrices = {
      // Individual Events
      "Integration Bee": 299,
      "Human vs AI": 299,
      "Retro Theming": 199,
      "Prompt Engineering": 199,
      "Reverse Engineering": 199,
      "Jack of Hearts": 399,
      "Singing": 99,
      "Dancing": 99,

      // Team Events
      "Singing Team": 99,
      "Dance Team": 99,
      "Hackathon Team": 999,
      "Accurate Prediction Team": 999,
      "E-sports Team": 799,
      "Polymath Team": 499,
      "Reverse Engineering Team": 199,
      "Retro Theming Team": 199,
      "Debate Team": 199,
      "Two Minute Manager Team": 149
    };
    
    // Update premium and accommodation fees
    this.PREMIUM_FEE = 200;
    this.ACCOMMODATION_FEE = 600;

    console.log('📧 University Email Service Initialized');
  }

  /**
   * Main registration handler with short IDs
   */
  async handleRegistration(registrationData, registrationType) {
    try {
      const { individualSeq, teamSeq } = await this.getNextSequenceNumbers();
      
      if (registrationType === 'individual') {
        // Generate short individual ID
        const registrationId = this.generateShortID('individual', individualSeq);
        
        const individualData = {
          ...registrationData,
          registrationType: 'individual',
          registrationId: registrationId
        };
        
        const result = await this.sendIndividualConfirmation(individualData);
        return {
          success: true,
          registrationId: registrationId,
          confirmation: result
        };
        
      } else if (registrationType === 'team') {
        // Generate short team ID
        const teamId = this.generateShortID('team', teamSeq);
        const teamLeaderId = teamId;
        
        const teamData = {
          ...registrationData,
          registrationType: 'team',
          registrationId: teamLeaderId,
          teamId: teamId,
          teamSize: registrationData.teamMembers.length + 1
        };
        
        const result = await this.sendTeamConfirmation(teamData);
        return {
          success: true,
          teamId: teamId,
          teamLeaderId: teamLeaderId,
          memberIds: registrationData.teamMembers.map((_, index) => 
            this.generateTeamMemberID(teamId, index + 1)
          ),
          confirmation: result
        };
      } else {
        throw new Error('Invalid registration type');
      }
      
    } catch (error) {
      console.error('❌ Registration handling failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get next sequence numbers for ID generation
   */
  async getNextSequenceNumbers() {
    // In production, replace with database queries
    // This ensures thread-safe sequence generation
    const sequences = {
      individualSeq: this.sequenceNumbers.individual++,
      teamSeq: this.sequenceNumbers.team++
    };
    
    console.log('🔢 Sequence numbers:', sequences);
    return sequences;
  }

  /**
   * Generate short, readable IDs for individuals and teams
   */
  generateShortID(registrationType, sequenceNumber) {
    const { INDIVIDUAL_PREFIX, TEAM_PREFIX } = ID_CONFIG;
    
    if (registrationType === 'individual') {
      return `${INDIVIDUAL_PREFIX}${sequenceNumber}`;
    } else {
      return `${TEAM_PREFIX}${sequenceNumber}`;
    }
  }

  /**
   * Generate team member IDs (CH25-T1-M1, CH25-T1-M2, etc.)
   */
  generateTeamMemberID(teamId, memberIndex) {
    return `${teamId}-M${memberIndex}`;
  }

  /**
   * Validate and clean registration data
   */
  validateRegistrationData(registrationData) {
    console.log('🛠 Validating registration data');
    
    // Create deep copy to avoid modifying original data
    const validatedData = JSON.parse(JSON.stringify(registrationData));
    
    // Validate different aspects of the data
    this._validateTotalAmount(validatedData);
    this._validatePaymentDetails(validatedData);
    this._validatePersonalDetails(validatedData);
    this._validateEventsData(validatedData);
    
    console.log('✅ Data validation completed - totalAmount:', validatedData.totalAmount);
    return validatedData;
  }

  _validateTotalAmount(data) {
    if (data.totalAmount === undefined || data.totalAmount === null || isNaN(data.totalAmount)) {
      console.log('🔄 Fixing invalid totalAmount:', data.totalAmount);
      
      if (data.paymentDetails && data.paymentDetails.amount && !isNaN(data.paymentDetails.amount)) {
        data.totalAmount = Number(data.paymentDetails.amount);
        console.log('💰 Using paymentDetails amount:', data.totalAmount);
      } else if (data.registrationType === 'individual' && data.prelimEvents) {
        data.totalAmount = this._calculateIndividualAmount(data.prelimEvents);
        console.log('🧮 Calculated from prelim events:', data.totalAmount);
      } else if (data.registrationType === 'team') {
        data.totalAmount = 2500;
        console.log('👥 Using default team amount:', data.totalAmount);
      } else {
        data.totalAmount = 0;
        console.log('🔄 Using fallback amount: 0');
      }
    }
    
    data.totalAmount = Number(data.totalAmount) || 0;
  }

  _calculateIndividualAmount(prelimEvents) {
    if (!prelimEvents || !Array.isArray(prelimEvents)) return 0;
    
    return prelimEvents.reduce((total, event) => {
      return total + (this.eventPrices[event] || 0);
    }, 0);
  }

  _validatePaymentDetails(data) {
    if (data.paymentDetails) {
      if (data.paymentDetails.amount === undefined || 
          data.paymentDetails.amount === null || 
          isNaN(data.paymentDetails.amount)) {
        data.paymentDetails.amount = data.totalAmount;
      }
      data.paymentDetails.amount = Number(data.paymentDetails.amount) || 0;
      
      if (!data.paymentDetails.status) {
        data.paymentDetails.status = 'completed';
      }
    }
  }

  _validatePersonalDetails(data) {
    if (data.registrationType === 'individual') {
      if (!data.personalDetails) {
        data.personalDetails = { name: 'Student', email: '', phone: '', college: '' };
      }
      
      data.personalDetails.name = data.personalDetails.name || 'Student';
      data.personalDetails.email = data.personalDetails.email || '';
      data.personalDetails.phone = data.personalDetails.phone || '';
      data.personalDetails.college = data.personalDetails.college || 'College not provided';
    } else if (data.registrationType === 'team') {
      if (!data.teamLeader) {
        data.teamLeader = { name: 'Team Leader', email: '', phone: '', college: '' };
      }
      
      data.teamLeader.name = data.teamLeader.name || 'Team Leader';
      data.teamLeader.email = data.teamLeader.email || '';
      data.teamLeader.phone = data.teamLeader.phone || '';
      data.teamLeader.college = data.teamLeader.college || 'College not provided';
      
      data.teamName = data.teamName || 'Unnamed Team';
      
      if (!data.teamMembers || !Array.isArray(data.teamMembers)) {
        data.teamMembers = [];
      }
      
      data.teamSize = data.teamMembers.length + 1;
    }
  }

  _validateEventsData(data) {
    if (data.registrationType === 'individual') {
      data.prelimEvents = Array.isArray(data.prelimEvents) ? data.prelimEvents : [];
      data.mainEvent = data.mainEvent || '';
    } else if (data.registrationType === 'team') {
      if (data.teamLeader && !Array.isArray(data.teamLeader.prelimEvents)) {
        data.teamLeader.prelimEvents = [];
      }
      data.teamLeader.mainEvent = data.teamLeader.mainEvent || '';
      
      data.teamMembers.forEach(member => {
        if (!Array.isArray(member.prelimEvents)) {
          member.prelimEvents = [];
        }
        member.mainEvent = member.mainEvent || '';
      });
    }
  }

  /**
   * Send confirmation email saying ID card will be sent within 48 hours
   */
  async sendQuickConfirmation(registrationData) {
    try {
      const email = registrationData.personalDetails?.email || registrationData.teamLeader?.email;
      const name = registrationData.personalDetails?.name || registrationData.teamLeader?.name;
      
      if (!email) {
        console.error('❌ No email address found for confirmation');
        return { success: false, error: 'No email address provided' };
      }

      if (!this.initialized) {
        console.warn(`📧 [SIMULATED] Quick confirmation for: ${email}`);
        return { success: true, quick: true, simulated: true };
      }

      // Check rate limiting
      if (this.dailyEmailCount >= this.MAX_EMAILS_PER_DAY) {
        console.warn('⚠ Daily email limit reached, skipping email');
        return { success: true, rateLimited: true };
      }

      const mailOptions = {
        to: email,
        from: {
          name: 'Chaitanya 2025 - HPTU',  // Professional sender name
          address: process.env.EMAIL_FROM || 'chaitanyahptu@gmail.com'
        },
        replyTo: process.env.EMAIL_FROM || 'chaitanyahptu@gmail.com',
        subject: 'Registration Confirmed - Chaitanya 2025',
        html: this._generateConfirmationHTML(registrationData, name),
        
        // 🎯 ANTI-SPAM HEADERS - Critical for inbox placement
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'X-Mailer': 'Chaitanya-Registration-System',
          'X-Entity-Ref-ID': `REG-${Date.now()}`,
          'List-Unsubscribe': '<mailto:chaitanyahptu@gmail.com>',
          'Content-Type': 'text/html; charset=UTF-8',
          'MIME-Version': '1.0'
        },
        
        // Message ID for tracking
        messageId: `<reg-${Date.now()}-${email.replace('@', '-at-')}@chaitanya.hptu.ac.in>`,
        encoding: 'utf-8'
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.dailyEmailCount++;
      console.log('✅ Confirmation email sent to:', email, 'Message ID:', info.messageId);
      return { success: true, quick: true };

    } catch (error) {
      console.error('❌ Email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  _generateConfirmationText(registrationData, name) {
    return `Dear ${name},

We have received your application request. Your ID card will be sent to you within next 48 hours.

REGISTRATION DETAILS:
Registration ID: ${registrationData.registrationId}
${registrationData.teamId ? `Team ID: ${registrationData.teamId}` : ''}

Your official ID card will be sent to this email within the next 48 hours.

If you don't receive it within 48 hours, please contact us at: chaitanyahptu@gmail.com

Best regards,
Chaitanya 2025 Team
Himachal Pradesh Technical University`;
  }

  _generateConfirmationHTML(registrationData, name) {
    const teamInfo = registrationData.teamId ? 
      `<p><strong>Team ID:</strong> ${registrationData.teamId}</p>` : '';

    // Premium info
    const premiumInfo = registrationData.isPremium ? 
      `<p><strong>Premium Package:</strong> ₹200 (Access to all individual events)</p>` : '';

    // Accommodation info
    let accommodationInfo = '';
    if (registrationData.needsAccommodation) {
      if (registrationData.registrationType === 'individual') {
        accommodationInfo = `<p><strong>Accommodation Fee:</strong> ₹600 (3 days stay)</p>`;
      } else {
        const accommodationTotal = 600 * (registrationData.teamSize || 1);
        accommodationInfo = `<p><strong>Accommodation Fee:</strong> ₹${accommodationTotal} (for ${registrationData.teamSize} members × ₹600 each)</p>`;
      }
    }

    // Events info
    let eventsInfo = '';
    if (registrationData.registrationType === 'individual' && registrationData.prelimEvents) {
      const eventsList = registrationData.prelimEvents.map(event => `• ${event}`).join('<br>');
      eventsInfo = `<p><strong>Selected Events:</strong><br>${eventsList}</p>`;
    } else if (registrationData.registrationType === 'team') {
      eventsInfo = `<p><strong>Main Event:</strong> ${registrationData.mainEvent || 'N/A'}</p>`;
      if (registrationData.esportsGame) {
        eventsInfo += `<p><strong>E-sports Game:</strong> ${registrationData.esportsGame}</p>`;
      }
    }

    // Total amount
    const totalAmount = registrationData.totalAmount || registrationData.amount || 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmed - Chaitanya 2025</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header with Success Badge -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 50px 30px; text-align: center; position: relative;">
                            <div style="background: rgba(255,255,255,0.2); width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.4);">
                                <span style="font-size: 50px;">🎉</span>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Registration Confirmed!</h1>
                            <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 16px;">Chaitanya 2025 - HPTU Technical Festival</p>
                            <div style="margin-top: 20px;">
                                <span style="background: rgba(255,255,255,0.3); color: #fff; padding: 8px 20px; border-radius: 25px; font-size: 13px; font-weight: 600; display: inline-block;">✅ SUCCESSFULLY REGISTERED</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 45px 35px;">
                            <h2 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 22px; font-weight: 600;">Dear ${name},</h2>
                            <p style="color: #5a6c7d; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
                                We're thrilled to confirm that your registration for <strong style="color: #8B0000;">Chaitanya 2025</strong> has been successfully completed! Get ready for an amazing experience.
                            </p>
                            
                            <!-- Registration Details Card -->
                            <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%); border-left: 5px solid #8B0000; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 4px 15px rgba(139,0,0,0.08);">
                                <h3 style="color: #8B0000; margin: 0 0 18px 0; font-size: 18px; font-weight: 700;">📋 Registration Details</h3>
                                <table width="100%" cellpadding="8" cellspacing="0" border="0">
                                    <tr>
                                        <td style="color: #5a6c7d; font-size: 14px; font-weight: 600; padding: 8px 0;">Registration ID:</td>
                                        <td style="text-align: right;">
                                            <code style="background: #fff; padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace; color: #8B0000; font-weight: 700; font-size: 14px; border: 1px solid #ffcccb;">${registrationData.registrationId}</code>
                                        </td>
                                    </tr>
                                    ${teamInfo ? `<tr><td colspan="2" style="padding: 8px 0; color: #5a6c7d; font-size: 14px;">${teamInfo}</td></tr>` : ''}
                                    <tr>
                                        <td style="color: #5a6c7d; font-size: 14px; font-weight: 600; padding: 8px 0;">Type:</td>
                                        <td style="text-align: right; color: #2c3e50; font-weight: 600; font-size: 14px;">${registrationData.registrationType === 'individual' ? '👤 Individual' : '👥 Team'}</td>
                                    </tr>
                                    ${registrationData.registrationType === 'team' && registrationData.teamSize ? `<tr><td style="color: #5a6c7d; font-size: 14px; font-weight: 600; padding: 8px 0;">Team Size:</td><td style="text-align: right; color: #2c3e50; font-weight: 600; font-size: 14px;">${registrationData.teamSize} members</td></tr>` : ''}
                                </table>
                                ${eventsInfo ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(139,0,0,0.2);">${eventsInfo}</div>` : ''}
                                ${premiumInfo ? `<div style="margin-top: 12px;">${premiumInfo}</div>` : ''}
                                ${accommodationInfo ? `<div style="margin-top: 12px;">${accommodationInfo}</div>` : ''}
                            </div>

                            <!-- ID Card Notice -->
                            <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-left: 5px solid #28a745; border-radius: 12px; padding: 22px; margin: 25px 0; box-shadow: 0 4px 15px rgba(40,167,69,0.1);">
                                <h4 style="color: #155724; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">🎫 Your ID Card is Coming!</h4>
                                <p style="color: #155724; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                                    <strong>Your official event ID card will be sent to your email within 48 hours.</strong>
                                </p>
                                <p style="color: #155724; margin: 0; font-size: 13px; line-height: 1.5;">
                                    Please check your inbox (and spam folder) for the ID card email. Bring your ID card to the event!
                                </p>
                            </div>

                            <!-- Payment Summary -->
                            <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%); border-left: 5px solid #ffc107; border-radius: 12px; padding: 22px; margin: 25px 0; box-shadow: 0 4px 15px rgba(255,193,7,0.1);">
                                <h4 style="color: #856404; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">💰 Payment Summary</h4>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="color: #856404; font-size: 15px; font-weight: 600;">Total Amount Paid:</td>
                                        <td style="text-align: right; color: #856404; font-size: 20px; font-weight: 800;">₹${totalAmount}</td>
                                    </tr>
                                </table>
                                <p style="color: #856404; margin: 10px 0 0 0; font-size: 12px;">
                                    <span style="background: #fff; padding: 4px 10px; border-radius: 12px; display: inline-block;">Payment Status: <strong style="color: #28a745;">Completed ✅</strong></span>
                                </p>
                            </div>

                            <!-- Contact Support -->
                            <div style="background: linear-gradient(135deg, #e7f3ff 0%, #cfe7ff 100%); border-left: 5px solid #0056b3; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                <h4 style="color: #0056b3; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">📧 Need Assistance?</h4>
                                <p style="color: #0056b3; margin: 0 0 8px 0; font-size: 13px;">
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
                        <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 35px; border-top: 1px solid #dee2e6; text-align: center;">
                            <p style="color: #2c3e50; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">
                                Best regards,<br>
                                <strong style="color: #8B0000;">The Chaitanya 2025 Team</strong><br>
                                <span style="color: #5a6c7d;">Himachal Pradesh Technical University</span>
                            </p>
                            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                                <p style="color: #95a5a6; margin: 0; font-size: 12px; line-height: 1.7;">
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
                        <td style="background: #2c3e50; padding: 20px; text-align: center;">
                            <p style="color: #95a5a6; margin: 0; font-size: 11px; line-height: 1.5;">
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

  // ==================== PUBLIC INTERFACE METHODS ====================

  async sendIndividualConfirmation(registrationData) {
    try {
      console.log('📧 [EMAIL DEBUG] Starting individual confirmation for:', registrationData.personalDetails.email);
      
      const quickResult = await this.sendQuickConfirmation(registrationData);
      console.log('✅ [EMAIL DEBUG] Confirmation result:', quickResult);
      
      return {
        success: true,
        message: 'Confirmation sent! Your ID card will be delivered within 48 hours.',
        email: registrationData.personalDetails.email,
        registrationId: registrationData.registrationId,
        confirmation: quickResult.success
      };

    } catch (error) {
      console.error('❌ [EMAIL DEBUG] Individual email failed:', error);
      return {
        success: false,
        message: 'Email failed: ' + error.message
      };
    }
  }

  async sendTeamConfirmation(registrationData) {
    try {
      console.log('📧 Sending team confirmation to:', registrationData.teamLeader.email);
      
      const quickResult = await this.sendQuickConfirmation(registrationData);
      
      return {
        success: true,
        message: 'Team confirmation sent! ID cards will be delivered within 48 hours.',
        email: registrationData.teamLeader.email,
        registrationId: registrationData.registrationId,
        teamId: registrationData.teamId,
        membersProcessed: registrationData.teamMembers.length,
        confirmation: quickResult.success
      };

    } catch (error) {
      console.error('❌ Team email failed:', error);
      return {
        success: false,
        message: 'Failed to send team confirmation: ' + error.message
      };
    }
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    return {
      dailyEmailCount: this.dailyEmailCount,
      maxDailyEmails: this.MAX_EMAILS_PER_DAY,
      emailsRemaining: Math.max(0, this.MAX_EMAILS_PER_DAY - this.dailyEmailCount)
    };
  }

  async testEmailService() {
    const testData = {
      registrationType: 'individual',
      personalDetails: {
        name: 'Test Student',
        email: 'chaitanyahptu@gmail.com',
        phone: '9876543210',
        college: 'Himachal Pradesh Technical University'
      },
      prelimEvents: ['Code Forge', 'Robo Rampage'],
      registrationId: 'CH25-I0001',
      totalAmount: 400
    };

    console.log('🧪 Testing email service with sample data...');
    return await this.sendIndividualConfirmation(testData);
  }

  clearCounters() {
    this.dailyEmailCount = 0;
    console.log('🧹 Email counters cleared');
    return { success: true, message: 'Counters cleared' };
  }

  /**
   * Close the transporter connection pool
   */
  async close() {
    if (this.transporter) {
      this.transporter.close();
      console.log('📧 Nodemailer transporter closed');
    }
  }
}

// Initialize sequence numbers
EmailService.prototype.sequenceNumbers = {
  individual: 1,
  team: 1
};

// Export service instance
module.exports = new EmailService();
