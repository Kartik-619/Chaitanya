const nodemailer = require('nodemailer');
const { EMAIL_CONFIG, ID_CONFIG } = require('../config/emailConfig');

class EmailService {
  constructor() {
    // Initialize Nodemailer transporter with connection pooling and rate limiting
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      pool: true, // Enable connection pooling
      maxConnections: 5,
      maxMessages: 100
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
      return ${INDIVIDUAL_PREFIX}${sequenceNumber};
    } else {
      return ${TEAM_PREFIX}${sequenceNumber};
    }
  }
}
  /**
   * Generate team member IDs (CH25-T1-M1, CH25-T1-M2, etc.)
   */
  generateTeamMemberID(teamId, memberIndex) {
    return ${teamId}-M${memberIndex};
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
        console.warn(📧 [SIMULATED] Quick confirmation for: ${email});
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
          name: 'Chaitanya 2025',
          address: process.env.EMAIL_FROM || 'chaitanyahptu@gmail.com'
        },
        subject: Your Chaitanya 2025 Registration Confirmation,
        text: this._generateConfirmationText(registrationData, name),
        html: this._generateConfirmationHTML(registrationData, name),
        // Priority headers
        headers: {
          'Priority': 'Urgent',
          'Importance': 'high',
          'X-Priority': '1',
          'X-MSMail-Priority': 'High'
        }
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
${registrationData.teamId ? Team ID: ${registrationData.teamId} : ''}

Your official ID card will be sent to this email within the next 48 hours.

If you don't receive it within 48 hours, please contact us at: chaitanyahptu@gmail.com

Best regards,
Chaitanya 2025 Team
Himachal Pradesh Technical University`;
  }

  _generateConfirmationHTML(registrationData, name) {
    const teamInfo = registrationData.teamId ? 
      <p><strong>Team ID:</strong> ${registrationData.teamId}</p> : '';

    // Premium info
    const premiumInfo = registrationData.isPremium ? 
      <p><strong>Premium Package:</strong> ₹200 (Access to all individual events)</p> : '';

    // Accommodation info
    let accommodationInfo = '';
    if (registrationData.needsAccommodation) {
      if (registrationData.registrationType === 'individual') {
        accommodationInfo = <p><strong>Accommodation Fee:</strong> ₹600 (3 days stay)</p>;
      } else {
        const accommodationTotal = 600 * (registrationData.teamSize || 1);
        accommodationInfo = <p><strong>Accommodation Fee:</strong> ₹${accommodationTotal} (for ${registrationData.teamSize} members × ₹600 each)</p>;
      }
    }

    // Events info
    let eventsInfo = '';
    if (registrationData.registrationType === 'individual' && registrationData.prelimEvents) {
      const eventsList = registrationData.prelimEvents.map(event => • ${event}).join('<br>');
      eventsInfo = <p><strong>Selected Events:</strong><br>${eventsList}</p>;
    } else if (registrationData.registrationType === 'team') {
      eventsInfo = <p><strong>Main Event:</strong> ${registrationData.mainEvent || 'N/A'}</p>;
      if (registrationData.esportsGame) {
        eventsInfo += <p><strong>E-sports Game:</strong> ${registrationData.esportsGame}</p>;
      }
    }

    // Total amount
    const totalAmount = registrationData.totalAmount || registrationData.amount || 0;

    return `<!DOCTYPE html>
  <html>
  <head>
      <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
          .header { background: linear-gradient(135deg, #8B0000, #B22222); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 25px; background: #f8f9fa; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
          .success-badge { background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8B0000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { margin-top: 25px; padding-top: 20px; border-top: 2px solid #dee2e6; color: #6c757d; font-size: 14px; text-align: center; }
          .contact { background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .amount { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
          .id-notice { background: #d4edda; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #28a745; }
      </style>
  </head>
  <body>
      <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Chaitanya 2025 - HPTU Technical Festival</p>
      </div>
      
      <div class="content">
          <div class="success-badge">✅ SUCCESSFULLY REGISTERED</div>
          
          <p>Dear <strong style="color: #8B0000;">${name}</strong>,</p>
          
          <p>We're excited to inform you that your registration for <strong>Chaitanya 2025</strong> has been successfully confirmed!</p>
          
          <div class="details">
              <h3 style="color: #8B0000; margin-top: 0;">Registration Details</h3>
              <p><strong>Registration ID:</strong> <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${registrationData.registrationId}</code></p>
              ${teamInfo}
              <p><strong>Registration Type:</strong> ${registrationData.registrationType === 'individual' ? 'Individual' : 'Team'}</p>
              ${registrationData.registrationType === 'team' && registrationData.teamSize ? <p><strong>Team Size:</strong> ${registrationData.teamSize} members</p> : ''}
              ${eventsInfo}
              ${premiumInfo}
              ${accommodationInfo}
          </div>

          <div class="id-notice">
              <h4 style="margin-top: 0; color: #155724;">🎫 Your ID Card is Coming!</h4>
              <p><strong>Your official ID card will be sent to this email address within the next 48 hours.</strong></p>
              <p>We are processing your registration and will send your ID card shortly. Please check your inbox (and spam folder) for the ID card email.</p>
          </div>

          <div class="amount">
              <h4 style="margin-top: 0; color: #856404;">💰 Payment Summary</h4>
              <p><strong>Total Amount Paid:</strong> ₹${totalAmount}</p>
              <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">Payment Status: Completed ✅</p>
          </div>

          <div class="contact">
              <h4 style="margin-top: 0; color: #0056b3;">📧 Need Help?</h4>
              <p>If you don't receive your ID card within 48 hours, please contact us:</p>
              <p>Email: <a href="mailto:chaitanyahptu@gmail.com" style="color: #8B0000;">chaitanyahptu@gmail.com</a></p>
          </div>

          <div class="footer">
              <p>Best regards,<br>
              <strong>The Chaitanya 2025 Team</strong><br>
              Himachal Pradesh Technical University</p>
              <div style="font-size: 12px; color: #666; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                <strong>Official Address:</strong><br>
                Chaitanya 2025 Technical Festival<br>
                Himachal Pradesh Technical University<br>
                Gandhi Chowk, Hamirpur, HP 177001<br>
                <a href="mailto:chaitanyahptu@gmail.com" style="color: #666;">Email Support</a>
            </div>
          </div>
      </div>
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
