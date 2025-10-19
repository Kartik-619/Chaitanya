/**
 * 📧 EMAIL SERVICE
 * 
 * This service handles all email and ID card operations:
 * - Registration confirmation emails
 * - PDF ID card generation and delivery
 * - Queue management for high-volume email sending
 * - Fallback systems for delivery guarantees
 * 
 * 🎫 ID CARD FEATURES:
 * - Individual, Team Leader, and Team Member ID cards
 * - QR code integration for attendance tracking
 * - Professional design with university branding
 * - Batch processing to avoid email limits
 * - Short IDs (CH25-I0001, CH25-T001, CH25-T001-M1)
 * - Portrait orientation (300x450px) with large QR codes
 */

const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { EMAIL_CONFIG, ID_CONFIG } = require('../config/emailConfig');

class EmailService {
  constructor() {
    // Initialize email transporter with connection pooling and rate limiting
    this.transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.UNIVERSITY_EMAIL,
      pass: process.env.UNIVERSITY_EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    // ✅ KEEP ALL YOUR RATE LIMITING SETTINGS:
    pool: true,           // Use connection pooling
    maxConnections: 5,    // Maximum simultaneous connections
    maxMessages: 100,     // Messages per connection
    rateDelta: 1000,      // Time window for rate limiting (1 second)
    rateLimit: 5,         // Emails per second (your existing setting)
    // Additional reliability settings
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  });

    // PDF generation queue system
    this.pdfQueue = [];                    // Queue for pending PDF generations
    this.isProcessingPDF = false;          // Flag to prevent concurrent processing
    this.dailyEmailCount = 0;              // Track emails sent today
    
    // Reset daily counter every 24 hours
    setInterval(() => {
      this.dailyEmailCount = 0;
      console.log('📧 Daily email counter reset to 0');
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    this.MAX_EMAILS_PER_DAY = 450;         // Gmail daily sending limit
    this.pdfDeliveryTracker = new Map();   // Track PDF delivery status
    
    // Sequence numbers for ID generation (in production, use database)
    this.sequenceNumbers = {
      individual: 1,
      team: 1
    };
    
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
      "E-sports Team": 999,
      "Polymath Team": 499,
      "Reverse Engineering Team": 199,
      "Retro Theming Team": 199,
      "Debate Team": 199,
      "Two Minute Manager Team": 149
    };
    
    // Update premium and accommodation fees
    this.PREMIUM_FEE = 200;
    this.ACCOMMODATION_FEE = 600;

    console.log('📧 University Email Service Initialized with Enhanced PDF System');
  }

  /**
 * Test email connection and configuration
 */
async testEmailConnection() {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('Email:', process.env.UNIVERSITY_EMAIL);
    console.log('Password exists:', !!process.env.UNIVERSITY_EMAIL_PASSWORD);
    
    if (!process.env.UNIVERSITY_EMAIL) {
      throw new Error('UNIVERSITY_EMAIL environment variable is not set');
    }
    
    if (!process.env.UNIVERSITY_EMAIL_PASSWORD) {
      throw new Error('UNIVERSITY_EMAIL_PASSWORD environment variable is not set');
    }

    // Test transporter connection
    await this.transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    return { 
      success: true, 
      message: 'Email configuration is correct',
      email: process.env.UNIVERSITY_EMAIL,
      password_length: process.env.UNIVERSITY_EMAIL_PASSWORD.length
    };
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      email: process.env.UNIVERSITY_EMAIL,
      debug: {
        email_set: !!process.env.UNIVERSITY_EMAIL,
        password_set: !!process.env.UNIVERSITY_EMAIL_PASSWORD,
        node_env: process.env.NODE_ENV
      }
    };
  }
}
  
  /**
   * Main registration handler with short IDs and portrait ID cards
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
    // CURRENT CODE (generates CH25-I0001):
    const paddedNumber = sequenceNumber.toString().padStart(4, '0');
    return `${INDIVIDUAL_PREFIX}${paddedNumber}`;
    
    // CHANGE TO (generates CH25-I1):
    return `${INDIVIDUAL_PREFIX}${sequenceNumber}`;
    
  } else {
    // CURRENT CODE (generates CH25-T001):
    const paddedNumber = sequenceNumber.toString().padStart(3, '0');
    return `${TEAM_PREFIX}${paddedNumber}`;
    
    // CHANGE TO (generates CH25-T1):
    return `${TEAM_PREFIX}${sequenceNumber}`;
  }
}
  /**
   * Generate team member IDs (CH25-T001-M1, CH25-T001-M2, etc.)
   */
  generateTeamMemberID(teamId, memberIndex) {
    return `${teamId}-M${memberIndex}`;
  }

  /**
   * Validate and clean registration data for PDF generation
   */
  validateRegistrationData(registrationData) {
    console.log('🛠️ Validating registration data for PDF generation');
    
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
   * Send quick confirmation email without PDF attachment
   */
  async sendQuickConfirmation(registrationData) {
    try {
      const email = registrationData.personalDetails?.email || registrationData.teamLeader?.email;
      const name = registrationData.personalDetails?.name || registrationData.teamLeader?.name;
      
      if (!email) {
        console.error('❌ No email address found for confirmation');
        return { success: false, error: 'No email address provided' };
      }

      const mailOptions = {
        from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: email,
        subject: `Chaitanya 2025 - Registration Confirmed ✅`,
        text: this._generateConfirmationText(registrationData, name),
        html: this._generateConfirmationHTML(registrationData, name)
      };

      const emailPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 30000)
      );

      await Promise.race([emailPromise, timeoutPromise]);
      
      this.dailyEmailCount++;
      console.log('✅ Quick confirmation sent to:', email);
      return { success: true, quick: true };

    } catch (error) {
      console.error('❌ Quick email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  _generateConfirmationText(registrationData, name) {
    return `Dear ${name},

Your registration for Chaitanya 2025 has been confirmed!

REGISTRATION DETAILS:
Registration ID: ${registrationData.registrationId}
${registrationData.teamId ? `Team ID: ${registrationData.teamId}` : ''}

Your official ID card will be sent to this email within the next few hours.

If you don't receive it within 24 hours, please contact us at: chaitanyahptu@gmail.com

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
              ${registrationData.registrationType === 'team' && registrationData.teamSize ? `<p><strong>Team Size:</strong> ${registrationData.teamSize} members</p>` : ''}
              ${eventsInfo}
              ${premiumInfo}
              ${accommodationInfo}
          </div>

          <div class="amount">
              <h4 style="margin-top: 0; color: #856404;">💰 Payment Summary</h4>
              <p><strong>Total Amount Paid:</strong> ₹${totalAmount}</p>
              <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">Payment Status: Completed ✅</p>
          </div>

          <div class="contact">
              <h4 style="margin-top: 0; color: #0056b3;">📧 What's Next?</h4>
              <p>Your official ID card is being generated and will be sent to this email address within the next few hours.</p>
              <p><strong>Please check your spam folder</strong> if you don't see it in your inbox.</p>
          </div>

          <div class="footer">
              <p><strong>Need Help?</strong><br>
              Email: <a href="mailto:chaitanyahptu@gmail.com" style="color: #8B0000;">chaitanyahptu@gmail.com</a></p>
              
              <p>Best regards,<br>
              <strong>The Chaitanya 2025 Team</strong><br>
              Himachal Pradesh Technical University</p>
          </div>
      </div>
  </body>
  </html>`;
  }

  /**
   * Start guaranteed PDF delivery process with tracking
   */
  async guaranteePDFDelivery(registrationData) {
    try {
      const validatedData = this.validateRegistrationData(registrationData);
      
      const tracker = {
        registrationId: validatedData.registrationId,
        email: validatedData.personalDetails?.email || validatedData.teamLeader?.email,
        attempts: 0,
        maxAttempts: 5,
        lastAttempt: null,
        delivered: false,
        data: validatedData,
        createdAt: new Date(),
        lastError: null
      };
      
      this.pdfDeliveryTracker.set(validatedData.registrationId, tracker);
      
      console.log(`📋 PDF tracking started for: ${validatedData.registrationId}`);
      
      await this.queuePDFGeneration(validatedData);
      
      return { 
        success: true, 
        message: 'PDF delivery process started',
        trackerId: validatedData.registrationId
      };

    } catch (error) {
      console.error('❌ PDF delivery guarantee failed:', error);
      return { 
        success: false, 
        message: 'Failed to start PDF delivery: ' + error.message 
      };
    }
  }

  /**
   * Add PDF generation to queue for batch processing
   */
  async queuePDFGeneration(registrationData) {
    try {
      console.log('📋 Queueing PDF for:', registrationData.registrationId);
      
      const validatedData = this.validateRegistrationData(registrationData);
      
      const tracker = this.pdfDeliveryTracker.get(validatedData.registrationId);
      if (tracker) {
        tracker.attempts++;
        tracker.lastAttempt = new Date();
        tracker.data = validatedData;
      }
      
      this.pdfQueue.push(validatedData);
      
      console.log(`📧 PDF queued: ${validatedData.registrationId} (Queue: ${this.pdfQueue.length})`);
      
      if (!this.isProcessingPDF) {
        this.processPDFQueue();
      }
      
    } catch (error) {
      console.error('❌ Error queueing PDF:', error);
    }
  }

  /**
   * Process PDF queue with rate limiting and error handling
   */
  async processPDFQueue() {
    if (this.isProcessingPDF) {
      console.log('⏸️ PDF processing already in progress');
      return;
    }
    
    this.isProcessingPDF = true;
    console.log('🔄 Starting PDF queue processing...');
    
    try {
      while (this.pdfQueue.length > 0 && this.dailyEmailCount < this.MAX_EMAILS_PER_DAY) {
        const data = this.pdfQueue[0];
        const tracker = this.pdfDeliveryTracker.get(data.registrationId);
        
        if (tracker && tracker.attempts >= tracker.maxAttempts) {
          console.log(`⏭️ Max attempts reached for: ${data.registrationId}, removing from queue`);
          this.pdfQueue.shift();
          continue;
        }
        
        const success = await this._processSinglePDF(data);
        
        if (success) {
          this.pdfQueue.shift();
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          const failed = this.pdfQueue.shift();
          this.pdfQueue.push(failed);
          await new Promise(resolve => setTimeout(resolve, 10000));
          break;
        }
      }
      
    } catch (error) {
      console.error('❌ PDF queue processing error:', error);
    } finally {
      this.isProcessingPDF = false;
      
      if (this.pdfQueue.length > 0) {
        console.log(`⏳ PDF queue has ${this.pdfQueue.length} items, continuing in 30 seconds...`);
        setTimeout(() => this.processPDFQueue(), 30000);
      } else {
        console.log('✅ PDF queue processing completed');
      }
    }
  }

  /**
   * Simple text-only fallback email when PDF generation fails
   */
  async sendSimpleConfirmation(registrationData) {
    const email = registrationData.personalDetails?.email || registrationData.teamLeader?.email;
    const name = registrationData.personalDetails?.name || registrationData.teamLeader?.name;
    
    const mailOptions = {
      from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: email,
      subject: `Chaitanya 2025 Registration Confirmed - ${registrationData.registrationId}`,
      text: `Dear ${name},

Your registration for Chaitanya 2025 has been confirmed!

REGISTRATION DETAILS:
Registration ID: ${registrationData.registrationId}
${registrationData.teamId ? `Team ID: ${registrationData.teamId}` : ''}

Please bring this Registration ID and college ID to the event venue.

If you have any questions, contact: chaitanyahptu@gmail.com

Best regards,
Chaitanya 2025 Team
Himachal Pradesh Technical University`
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Process single PDF generation and email delivery
   */
  async _processSinglePDF(data) {
    const tracker = this.pdfDeliveryTracker.get(data.registrationId);
    const attempt = tracker?.attempts || 1;
    
    try {
      console.log(`🔄 Generating PDF for: ${data.registrationId} (Attempt ${attempt})`);
      
      let pdfBuffer, filename, recipientEmail, recipientName;
      
      switch (data.registrationType) {
        case 'individual':
          pdfBuffer = await this.generateIndividualIDCard(data);
          filename = `Chaitanya2025-ID-${data.registrationId}.pdf`;
          recipientEmail = data.personalDetails.email;
          recipientName = data.personalDetails.name;
          break;
          
        case 'team_member':
          pdfBuffer = await this.generateTeamMemberIDCard(data);
          filename = `Chaitanya2025-Member-${data.registrationId}.pdf`;
          recipientEmail = data.personalDetails.email;
          recipientName = data.personalDetails.name;
          break;
          
        default:
          pdfBuffer = await this.generateTeamLeaderIDCard(data);
          filename = `Chaitanya2025-TeamLeader-${data.registrationId}.pdf`;
          recipientEmail = data.teamLeader.email;
          recipientName = data.teamLeader.name;
      }
      
      await this._sendPDFEmail(recipientEmail, recipientName, data, pdfBuffer, filename);
      
      if (tracker) {
        tracker.delivered = true;
        tracker.deliveredAt = new Date();
        tracker.lastError = null;
      }
      
      console.log('✅ PDF delivered to:', recipientEmail);
      return true;
      
    } catch (error) {
      console.error(`❌ PDF delivery failed for ${data.registrationId}:`, error.message);
      
      if (tracker) {
        tracker.lastError = error.message;
      }
      
      return false;
    }
  }

  /**
   * Send PDF email with attachment
   */
  async _sendPDFEmail(email, name, data, pdfBuffer, filename) {
    const mailOptions = {
      from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: email,
      subject: `Chaitanya 2025 - Your Official ID Card 🎫`,
      text: this._generatePDFEmailText(name, data),
      html: this._generatePDFEmailHTML(name, data),
      attachments: [{
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    const emailPromise = this.transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 45000)
    );

    await Promise.race([emailPromise, timeoutPromise]);
    this.dailyEmailCount++;
  }

  _generatePDFEmailText(name, data) {
    const teamInfo = data.teamId ? `Team ID: ${data.teamId}` : '';
    
    return `Dear ${name},

Your official Chaitanya 2025 ID card is attached!

REGISTRATION CONFIRMED:
Registration ID: ${data.registrationId}
${teamInfo}

Please bring a printed copy of this ID card or show the digital version at the event registration desk.

This ID card is required for entry to all events and workshops.

If you have any issues, please contact: chaitanyahptu@gmail.com

Best regards,
Chaitanya 2025 Team
Himachal Pradesh Technical University`;
  }

  _generatePDFEmailHTML(name, data) {
    const teamInfo = data.teamId ? 
      `<p><strong>Team ID:</strong> <code>${data.teamId}</code></p>` : '';

    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
        .header { background: linear-gradient(135deg, #8B0000, #B22222); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 25px; background: #f8f9fa; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; }
        .id-badge { background: #17a2b8; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
        .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #17a2b8; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { margin-top: 25px; padding-top: 20px; border-top: 2px solid #dee2e6; color: #6c757d; font-size: 14px; text-align: center; }
        .instructions { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎫 Your Official ID Card</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Chaitanya 2025 - HPTU Technical Festival</p>
    </div>
    
    <div class="content">
        <div class="id-badge">📄 ID CARD ATTACHED</div>
        
        <p>Dear <strong style="color: #8B0000;">${name}</strong>,</p>
        
        <p>Your official <strong>Chaitanya 2025 ID card</strong> is ready and attached to this email!</p>
        
        <div class="details">
            <h3 style="color: #17a2b8; margin-top: 0;">Registration Details</h3>
            <p><strong>Registration ID:</strong> <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.registrationId}</code></p>
            ${teamInfo}
            <p><strong>Registration Type:</strong> ${data.registrationType === 'individual' ? 'Individual' : 'Team'}</p>
        </div>

        <div class="instructions">
            <h4 style="margin-top: 0; color: #856404;">📋 Important Instructions</h4>
            <p><strong>Please bring a printed copy of this ID card</strong> or be ready to show the digital version at the event registration desk.</p>
            <p>This ID card is required for entry to all events, workshops, and competition venues.</p>
        </div>

        <div class="footer">
            <p><strong>Need Help?</strong><br>
            Email: <a href="mailto:chaitanyahptu@gmail.com" style="color: #8B0000;">chaitanyahptu@gmail.com</a></p>
            
            <p>Best regards,<br>
            <strong>The Chaitanya 2025 Team</strong><br>
            Himachal Pradesh Technical University</p>
        </div>
    </div>
</body>
</html>`;
  }

// ==================== INDIVIDUAL ID CARD ====================

async generateIndividualIDCard(data) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🎨 Generating portrait individual ID card for:', data.registrationId);

      const validatedData = this.validateRegistrationData(data);
      
      const doc = new PDFDocument({ 
        size: [300, 450], 
        margin: 0
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ==== BACKGROUND ==== (Updated gradient: Sky Blue to Light Green)
      const gradient = doc.linearGradient(0, 0, 300, 450);
      gradient.stop(0, '#87CEEB').stop(1, '#90EE90');
      doc.rect(0, 0, 300, 450).fill(gradient);

      // Navy border
      doc.lineWidth(3).strokeColor('#1E3A5F').rect(8, 8, 284, 434).stroke();

      // ==== HEADER ====
      doc.fillColor('#1E3A5F')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('CHAITANYA 2025', 0, 20, { align: 'center' });

      doc.fontSize(8)
        .fillColor('#1E3A5F')
        .text('HPTU TECHNICAL FESTIVAL', 0, 37, { align: 'center' });

      doc.strokeColor('#1E3A5F').lineWidth(1)
        .moveTo(20, 50).lineTo(280, 50).stroke();

      // ==== PROFILE SECTION ====
      const centerX = 150;
      const profileY = 65;
      
      doc.circle(centerX, profileY + 30, 35)
        .fillColor('#FFFFFF')
        .fill();

      const initials = this._getInitials(validatedData.personalDetails.name);
      doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(initials, centerX - doc.widthOfString(initials) / 2, profileY + 18);

      const displayName = this._truncateText(validatedData.personalDetails.name, 18);
      doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(displayName, 15, profileY + 72, { width: 270, align: 'center' });

      // Badge
      doc.roundedRect(centerX - 40, profileY + 88, 80, 16, 3)
        .fillColor('#FFFFFF')
        .fill();
      doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('PARTICIPANT', centerX - doc.widthOfString('PARTICIPANT') / 2, profileY + 92);

      // ==== DETAILS SECTION ====
      const detailsY = profileY + 118;
      const lineSpacing = 24;

      // Reg ID
      doc.fillColor('#1E3A5F')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Reg ID:', 20, detailsY);

      doc.fillColor('#000000')
        .font('Helvetica')
        .fontSize(8)
        .text(validatedData.registrationId, 75, detailsY, { width: 200 });

      // College
      doc.fillColor('#1E3A5F')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('College:', 20, detailsY + lineSpacing);

      const collegeText = validatedData.personalDetails.college || 'Not provided';
      doc.fillColor('#000000')
        .font('Helvetica')
        .fontSize(7)
        .text(collegeText, 75, detailsY + lineSpacing, { 
          width: 200,
          lineGap: 2
        });

      // Events
      const collegeHeight = doc.heightOfString(collegeText, { width: 200, lineGap: 2 });
      const eventsY = detailsY + lineSpacing + Math.max(collegeHeight, 10) + 14;
      
      doc.fillColor('#1E3A5F')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Events:', 20, eventsY);

      const eventsText = this._getEventsText(validatedData);
      doc.fillColor('#000000')
        .font('Helvetica')
        .fontSize(7)
        .text(eventsText, 75, eventsY, { 
          width: 200,
          lineGap: 2
        });

      // ==== QR CODE ====
      const eventsHeight = doc.heightOfString(eventsText, { width: 200, lineGap: 2 });
      const qrY = eventsY + Math.max(eventsHeight, 10) + 18;
      const qrSize = 90;

      doc.rect(centerX - qrSize/2 - 5, qrY - 5, qrSize + 10, qrSize + 10)
        .fillColor('#FFFFFF')
        .fill();

      try {
        const qrPayload = {
          reg_id: validatedData.registrationId,
          name: validatedData.personalDetails.name,
          college: validatedData.personalDetails.college,
          events: validatedData.prelimEvents,
          main_event: validatedData.mainEvent
        };
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          width: qrSize * 4,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        doc.image(qrDataUrl, centerX - qrSize/2, qrY, { 
          width: qrSize, 
          height: qrSize 
        });
      } catch (qrError) {
        console.error('QR Code generation failed:', qrError);
        doc.fillColor('#000000')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('QR CODE', centerX - 25, qrY + 35, { align: 'center' });
      }

      doc.fillColor('#1E3A5F')
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('SCAN FOR DETAILS', 0, qrY + qrSize + 12, { align: 'center', width: 300 });

      // ==== FOOTER ====
      const footerY = 400;
      
      doc.strokeColor('#1E3A5F').lineWidth(1)
        .moveTo(20, footerY).lineTo(280, footerY).stroke();

      doc.fillColor('#1E3A5F')
        .font('Helvetica')
        .fontSize(6)
        .text('Official ID • Chaitanya 2025', 0, footerY + 8, { align: 'center' });

      doc.fontSize(5)
        .text(`Issued: ${new Date().toLocaleDateString()}`, 0, footerY + 18, { align: 'center' });

      doc.end();
    } catch (err) {
      console.error('❌ Individual ID card generation failed:', err);
      reject(err);
    }
  });
}

// ==================== TEAM LEADER ID CARD ====================

async generateTeamLeaderIDCard(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const validatedData = this.validateRegistrationData(data);
      const doc = new PDFDocument({ size: [300, 450], margin: 0 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Background (Updated gradient: Sky Blue to Light Green)
      const gradient = doc.linearGradient(0, 0, 300, 450);
      gradient.stop(0, "#87CEEB").stop(1, "#90EE90");
      doc.rect(0, 0, 300, 450).fill(gradient);

      doc.lineWidth(3).strokeColor("#1E3A5F").rect(8, 8, 284, 434).stroke();

      // Header
      doc.fillColor("#1E3A5F")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("CHAITANYA 2025", 0, 20, { align: "center" });
      doc.fontSize(8)
        .fillColor("#1E3A5F")
        .text("HPTU TECHNICAL FESTIVAL", 0, 37, { align: "center" });
      doc.strokeColor("#1E3A5F").lineWidth(1)
        .moveTo(20, 50).lineTo(280, 50).stroke();

      const centerX = 150;
      const profileY = 65;

      // Profile
      doc.circle(centerX, profileY + 30, 35).fillColor("#FFFFFF").fill();

      const initials = this._getInitials(validatedData.teamLeader.name);
      doc.fillColor("#000000")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(initials, centerX - doc.widthOfString(initials) / 2, profileY + 18);

      const displayName = this._truncateText(validatedData.teamLeader.name, 18);
      doc.fillColor("#000000")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(displayName, 15, profileY + 72, { width: 270, align: "center" });

      // Leader Badge
      doc.roundedRect(centerX - 50, profileY + 88, 100, 16, 3)
        .fillColor("#FF9500")
        .fill();
      doc.fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(7)
        .text("TEAM LEADER", centerX - doc.widthOfString("TEAM LEADER") / 2, profileY + 92);

      // Details
      let detailsY = profileY + 118;
      const lineSpacing = 18;

      const addField = (label, value, isMultiline = false) => {
        doc.fillColor("#1E3A5F").font("Helvetica-Bold").fontSize(8).text(label, 20, detailsY);
        const textValue = value || "Not provided";
        doc.fillColor("#000000").font("Helvetica").fontSize(8).text(textValue, 75, detailsY, { width: 200, lineGap: 1 });
        
        if (isMultiline) {
          const textHeight = doc.heightOfString(textValue, { width: 200, lineGap: 1 });
          detailsY += Math.max(textHeight + 4, lineSpacing);
        } else {
          detailsY += lineSpacing;
        }
      };

      addField("Reg ID:", validatedData.registrationId);
      addField("College:", validatedData.teamLeader.college, true);
      addField("Team ID:", validatedData.teamId);
      addField("Team:", validatedData.teamName);
      addField("Main Event:", validatedData.mainEvent);

      // Premium Badge (Fixed spacing)
      const hasPremium = this._hasPremiumPackage(validatedData);
      if (hasPremium) {
        detailsY += 5; // Add spacing before premium badge
        doc.roundedRect(centerX - 45, detailsY, 90, 14, 3)
          .fillColor("#FFD700")
          .fill();
        doc.fillColor("#000000")
          .font("Helvetica-Bold")
          .fontSize(7)
          .text("PREMIUM ACCESS", centerX - doc.widthOfString("PREMIUM ACCESS") / 2, detailsY + 3);
        detailsY += 22; // Add spacing after premium badge
      } else {
        detailsY += 5; // Consistent spacing when no premium badge
      }

      // QR Code Section (Dynamic Position with proper spacing)
      const qrSize = 85;
      const qrY = Math.min(detailsY + 6, 450 - (qrSize + 60));

      doc.rect(centerX - qrSize / 2 - 5, qrY - 5, qrSize + 10, qrSize + 10)
        .fillColor("#FFFFFF").fill();

      try {
        const qrPayload = {
          team_id: validatedData.teamId,
          team_name: validatedData.teamName,
          type: "team_leader",
          reg_id: validatedData.registrationId,
          name: validatedData.teamLeader.name,
          college: validatedData.teamLeader.college,
          premium: hasPremium,
        };
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          width: qrSize * 4,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        doc.image(qrDataUrl, centerX - qrSize / 2, qrY, { width: qrSize, height: qrSize });
      } catch {
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("QR CODE", centerX - 20, qrY + 25);
      }

      doc.fillColor("#1E3A5F")
        .font("Helvetica-Bold")
        .fontSize(7)
        .text("SCAN FOR DETAILS", 0, qrY + qrSize + 10, { align: "center", width: 300 });

      // Footer
      const footerY = 420;
      doc.strokeColor("#1E3A5F").lineWidth(1)
        .moveTo(20, footerY).lineTo(280, footerY).stroke();
      doc.fillColor("#1E3A5F").font("Helvetica").fontSize(6)
        .text("Official ID • Chaitanya 2025", 0, footerY + 6, { align: "center" });
      doc.fontSize(5)
        .text(`Issued: ${new Date().toLocaleDateString()}`, 0, footerY + 15, { align: "center" });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// ==================== TEAM MEMBER ID CARD ====================

async generateTeamMemberIDCard(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const validatedData = this.validateRegistrationData(data);
      const doc = new PDFDocument({ size: [300, 450], margin: 0 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Background (Updated gradient: Sky Blue to Light Green)
      const gradient = doc.linearGradient(0, 0, 300, 450);
      gradient.stop(0, "#87CEEB").stop(1, "#90EE90");
      doc.rect(0, 0, 300, 450).fill(gradient);

      doc.lineWidth(3).strokeColor("#1E3A5F").rect(8, 8, 284, 434).stroke();

      // Header
      doc.fillColor("#1E3A5F")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("CHAITANYA 2025", 0, 20, { align: "center" });
      doc.fontSize(8)
        .fillColor("#1E3A5F")
        .text("HPTU TECHNICAL FESTIVAL", 0, 37, { align: "center" });
      doc.strokeColor("#1E3A5F").lineWidth(1)
        .moveTo(20, 50).lineTo(280, 50).stroke();

      const centerX = 150;
      const profileY = 65;

      doc.circle(centerX, profileY + 30, 35).fillColor("#FFFFFF").fill();
      const initials = this._getInitials(validatedData.personalDetails.name);
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(24)
        .text(initials, centerX - doc.widthOfString(initials) / 2, profileY + 18);

      const displayName = this._truncateText(validatedData.personalDetails.name, 18);
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(11)
        .text(displayName, 15, profileY + 72, { width: 270, align: "center" });

      // Member Badge
      doc.roundedRect(centerX - 50, profileY + 88, 100, 16, 3)
        .fillColor("#00BCD4").fill();
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(7)
        .text("TEAM MEMBER", centerX - doc.widthOfString("TEAM MEMBER") / 2, profileY + 92);

      // Details
      let detailsY = profileY + 118;
      const lineSpacing = 18;
      const addField = (label, value) => {
        doc.fillColor("#1E3A5F").font("Helvetica-Bold").fontSize(8).text(label, 20, detailsY);
        doc.fillColor("#000000").font("Helvetica").fontSize(8).text(value || "Not provided", 75, detailsY, { width: 200 });
        detailsY += lineSpacing;
      };

      addField("Reg ID:", validatedData.registrationId);
      addField("College:", validatedData.personalDetails.college);
      addField("Team ID:", validatedData.teamId);
      addField("Team:", validatedData.teamName);
      addField("Main Event:", validatedData.mainEvent);

      // Premium Badge (Fixed spacing)
      const hasPremium = this._hasPremiumPackage(validatedData);
      if (hasPremium) {
        detailsY += 12; // Add proper spacing before premium badge
        doc.roundedRect(centerX - 45, detailsY, 90, 14, 3)
          .fillColor("#FFD700").fill();
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(7)
          .text("PREMIUM ACCESS", centerX - doc.widthOfString("PREMIUM ACCESS") / 2, detailsY + 3);
        detailsY += 32; // Add proper spacing after premium badge
      } else {
        detailsY += 12; // Consistent spacing when no premium badge
      }

      // QR Code (Dynamic Position with proper spacing)
      const qrSize = 85;
      const qrY = Math.min(detailsY + 8, 450 - (qrSize + 60));

      doc.rect(centerX - qrSize / 2 - 5, qrY - 5, qrSize + 10, qrSize + 10)
        .fillColor("#FFFFFF").fill();

      try {
        const qrPayload = {
          team_id: validatedData.teamId,
          team_name: validatedData.teamName,
          type: "team_member",
          reg_id: validatedData.registrationId,
          name: validatedData.personalDetails.name,
          college: validatedData.personalDetails.college,
          member_index: validatedData.memberIndex,
          premium: hasPremium,
        };
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          width: qrSize * 4,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        doc.image(qrDataUrl, centerX - qrSize / 2, qrY, { width: qrSize, height: qrSize });
      } catch {
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8).text("QR CODE", centerX - 20, qrY + 25);
      }

      doc.fillColor("#1E3A5F").font("Helvetica-Bold").fontSize(7)
        .text("SCAN FOR DETAILS", 0, qrY + qrSize + 10, { align: "center", width: 300 });

      // Footer
      const footerY = 420;
      doc.strokeColor("#1E3A5F").lineWidth(1)
        .moveTo(20, footerY).lineTo(280, footerY).stroke();
      doc.fillColor("#1E3A5F").font("Helvetica").fontSize(6)
        .text("Official ID • Chaitanya 2025", 0, footerY + 6, { align: "center" });
      doc.fontSize(5)
        .text(`Issued: ${new Date().toLocaleDateString()}`, 0, footerY + 15, { align: "center" });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// ==================== HELPER METHODS ====================

_getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);
}

_truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

_getEventsText(data, type = 'individual') {
  let events = [];
  
  if (type === 'individual') {
    events = data.prelimEvents || [];
  } else if (type === 'team_leader') {
    events = data.teamLeader?.prelimEvents || [];
  } else if (type === 'team_member') {
    events = data.personalDetails?.prelimEvents || [];
  }

  if (events.length > 0) {
    return events.join(', ');
  }
  
  return 'Not specified';
}

_hasPremiumPackage(data) {
  return data.isPremium === true || data.teamData?.isPremium === true;
}

  // ==================== PUBLIC INTERFACE METHODS ====================

  async sendIndividualConfirmation(registrationData) {
    try {
      console.log('📧 [EMAIL DEBUG] Starting individual confirmation for:', registrationData.personalDetails.email);
      
      const quickResult = await this.sendQuickConfirmation(registrationData);
      console.log('✅ [EMAIL DEBUG] Quick confirmation result:', quickResult);
      
      const pdfResult = await this.guaranteePDFDelivery(registrationData);
      console.log('✅ [EMAIL DEBUG] PDF delivery started:', pdfResult);
      
      return {
        success: true,
        message: 'Confirmation sent! ID card delivery in progress.',
        email: registrationData.personalDetails.email,
        registrationId: registrationData.registrationId,
        quickConfirmation: quickResult.success,
        pdfDelivery: pdfResult.success
      };

    } catch (error) {
      console.error('❌ [EMAIL DEBUG] Individual email failed:', error);
      
      try {
        console.log('🔄 Trying fallback text email...');
        await this.sendSimpleConfirmation(registrationData);
        return {
          success: true,
          message: 'Simple confirmation sent (PDF failed)',
          fallback: true,
          email: registrationData.personalDetails.email
        };
      } catch (fallbackError) {
        console.error('❌ Fallback email also failed:', fallbackError);
        return {
          success: false,
          message: 'All email methods failed: ' + fallbackError.message
        };
      }
    }
  }

  async sendTeamConfirmation(registrationData) {
    try {
      console.log('📧 Sending team confirmation to:', registrationData.teamLeader.email);
      
      const quickResult = await this.sendQuickConfirmation(registrationData);
      
      await this.guaranteePDFDelivery(registrationData);
      
      for (let i = 0; i < registrationData.teamMembers.length; i++) {
        const member = registrationData.teamMembers[i];
        const memberRegistrationId = this.generateTeamMemberID(registrationData.teamId, i + 1);
        
        await this.guaranteePDFDelivery({
          ...registrationData,
          registrationType: 'team_member',
          registrationId: memberRegistrationId,
          teamId: registrationData.teamId,
          personalDetails: member,
          memberIndex: i + 1
        });
        
        console.log(`✅ Team member ${i + 1} ID card queued: ${memberRegistrationId}`);
      }
      
      return {
        success: true,
        message: 'Team confirmation sent! ID cards delivery in progress.',
        email: registrationData.teamLeader.email,
        registrationId: registrationData.registrationId,
        teamId: registrationData.teamId,
        membersProcessed: registrationData.teamMembers.length,
        quickConfirmation: quickResult.success
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
   * Get all pending PDF deliveries for monitoring
   */
  getPendingDeliveries() {
    const pending = [];
    
    for (const [registrationId, tracker] of this.pdfDeliveryTracker) {
      if (!tracker.delivered && tracker.attempts < tracker.maxAttempts) {
        pending.push({
          registrationId,
          email: tracker.email,
          attempts: tracker.attempts,
          lastAttempt: tracker.lastAttempt,
          createdAt: tracker.createdAt
        });
      }
    }
    
    return pending;
  }

  /**
   * Clean up old delivery trackers (maintenance)
   */
  cleanupOldTrackers() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    let cleanedCount = 0;
    
    for (const [registrationId, tracker] of this.pdfDeliveryTracker) {
      if (tracker.createdAt < sevenDaysAgo && 
          (tracker.delivered || tracker.attempts >= tracker.maxAttempts)) {
        this.pdfDeliveryTracker.delete(registrationId);
        cleanedCount++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleanedCount} old delivery trackers`);
    return cleanedCount;
  }

  /**
   * Get detailed delivery analytics
   */
  getDeliveryAnalytics() {
    const trackers = Array.from(this.pdfDeliveryTracker.values());
    const total = trackers.length;
    const delivered = trackers.filter(t => t.delivered).length;
    const pending = trackers.filter(t => !t.delivered && t.attempts < t.maxAttempts).length;
    const failed = trackers.filter(t => !t.delivered && t.attempts >= t.maxAttempts).length;
    
    return {
      total,
      delivered,
      pending,
      failed,
      successRate: total > 0 ? ((delivered / total) * 100).toFixed(2) + '%' : '0%',
      averageAttempts: total > 0 ? (trackers.reduce((sum, t) => sum + t.attempts, 0) / total).toFixed(2) : 0
    };
  }

  getPDFDeliveryStatus(registrationId) {
    const tracker = this.pdfDeliveryTracker.get(registrationId);
    if (!tracker) {
      return { 
        delivered: false, 
        status: 'not_tracked', 
        message: 'PDF delivery not tracked for this registration' 
      };
    }
    
    return {
      delivered: tracker.delivered,
      attempts: tracker.attempts,
      maxAttempts: tracker.maxAttempts,
      lastAttempt: tracker.lastAttempt,
      deliveredAt: tracker.deliveredAt,
      lastError: tracker.lastError,
      status: tracker.delivered ? 'delivered' : 
              tracker.attempts >= tracker.maxAttempts ? 'failed' : 'pending',
      email: tracker.email,
      registrationId: tracker.registrationId
    };
  }

  async retryPDFDelivery(registrationId) {
    const tracker = this.pdfDeliveryTracker.get(registrationId);
    if (!tracker) {
      return { success: false, message: 'Registration not found in tracker' };
    }
    
    if (tracker.delivered) {
      return { success: false, message: 'PDF already delivered' };
    }
    
    tracker.attempts = 0;
    tracker.maxAttempts = 5;
    tracker.lastError = null;
    
    console.log(`🔄 Manual PDF retry initiated for: ${registrationId}`);
    await this.queuePDFGeneration(tracker.data);
    
    return { success: true, message: 'PDF retry queued' };
  }

  getSystemStats() {
    return {
      pdfQueueLength: this.pdfQueue.length,
      isProcessingPDF: this.isProcessingPDF,
      dailyEmailCount: this.dailyEmailCount,
      maxDailyEmails: this.MAX_EMAILS_PER_DAY,
      trackedDeliveries: this.pdfDeliveryTracker.size,
      successfulDeliveries: Array.from(this.pdfDeliveryTracker.values()).filter(t => t.delivered).length,
      failedDeliveries: Array.from(this.pdfDeliveryTracker.values()).filter(t => !t.delivered && t.attempts >= t.maxAttempts).length
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

  async testPDFGeneration() {
    const testData = {
      registrationType: 'individual',
      personalDetails: {
        name: 'Test Student',
        email: 'test@example.com',
        phone: '9876543210',
        college: 'Himachal Pradesh Technical University'
      },
      prelimEvents: ['Code Forge', 'Robo Rampage'],
      registrationId: 'CH25-I0001',
      totalAmount: 400
    };

    console.log('🧪 Testing PDF generation...');
    
    try {
      const pdfBuffer = await this.generateIndividualIDCard(testData);
      console.log('✅ PDF generated successfully! Buffer size:', pdfBuffer.length, 'bytes');
      
      const fs = require('fs');
      fs.writeFileSync('./test-id-card.pdf', pdfBuffer);
      console.log('💾 Test PDF saved as: test-id-card.pdf');
      
      return { success: true, size: pdfBuffer.length };
    } catch (error) {
      console.error('❌ PDF generation test failed:', error);
      return { success: false, error: error.message };
    }
  }

  clearAllQueues() {
    this.pdfQueue = [];
    this.pdfDeliveryTracker.clear();
    this.dailyEmailCount = 0;
    console.log('🧹 All email queues and trackers cleared');
    return { success: true, message: 'All queues cleared' };
  }
}

// Export service instance
module.exports = new EmailService();
