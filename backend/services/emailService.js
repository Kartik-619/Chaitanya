const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { EMAIL_CONFIG } = require('../config/emailConfig');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: EMAIL_CONFIG.SERVICE,
      auth: {
        user: EMAIL_CONFIG.FROM_EMAIL,
        pass: process.env.UNIVERSITY_EMAIL_PASSWORD
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5
    });

    this.pdfQueue = [];
    this.isProcessingPDF = false;
    this.dailyEmailCount = 0;
    this.MAX_EMAILS_PER_DAY = 450;
    this.pdfDeliveryTracker = new Map();
    
    this.eventPrices = {
      "Code Forge": 200,
      "Robo Rampage": 200,
      "Integration Bee": 150,
      "Encryption/Decryption": 150,
      "Reverse Engineering": 200,
      "Bug Bounty / CTF": 300,
      "Data Analysis Challenge": 250,
      "Stock Prediction": 200,
      "Sports Analytics": 150
    };

    console.log('📧 University Email Service Initialized with Enhanced PDF System');
  }

  validateRegistrationData(registrationData) {
    console.log('🛠️ Validating registration data for PDF generation');
    
    const validatedData = JSON.parse(JSON.stringify(registrationData));
    
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
      } 
      else if (data.registrationType === 'individual' && data.prelimEvents) {
        data.totalAmount = this._calculateIndividualAmount(data.prelimEvents);
        console.log('🧮 Calculated from prelim events:', data.totalAmount);
      }
      else if (data.registrationType === 'team') {
        data.totalAmount = 2500;
        console.log('👥 Using default team amount:', data.totalAmount);
      }
      else {
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

  // FIXED: Individual ID Card without amount
  async generateIndividualIDCard(data) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🎨 Generating individual ID card for:', data.registrationId);

        const validatedData = this.validateRegistrationData(data);
        const doc = new PDFDocument({ size: [400, 250], margin: 0 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // ==== Background ====
        const gradient = doc.linearGradient(0, 0, 400, 250);
        gradient.stop(0, '#7B1E1E').stop(1, '#420000');
        doc.rect(0, 0, 400, 250).fill(gradient);

        // Card border with gold line
        doc.lineWidth(3).strokeColor('#FFD700').rect(5, 5, 390, 240).stroke();

        // ==== Header ====
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(18)
           .text('CHAITANYA 2025', 0, 15, { align: 'center' });

        doc.fontSize(9)
           .fillColor('#F8E9A1')
           .text('HPTU TECHNICAL FESTIVAL', 0, 35, { align: 'center' });

        // ==== Profile Section ====
        const profileX = 20, profileY = 60;
        
        // Profile circle
        doc.circle(profileX + 40, profileY + 40, 40)
           .fillColor('#FFFFFF')
           .fill();

        // Initials
        const initials = (validatedData.personalDetails.name || 'S')
          .split(' ')
          .map(w => w[0]?.toUpperCase() || '')
          .join('')
          .slice(0, 2);

        doc.fillColor('#8B0000')
           .font('Helvetica-Bold')
           .fontSize(22)
           .text(initials, profileX + 40 - doc.widthOfString(initials) / 2, profileY + 32);

        // Name
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(11)
           .text(validatedData.personalDetails.name, profileX, profileY + 90, { 
             width: 80, 
             align: 'center',
             lineBreak: false
           });

        // Role badge
        doc.roundedRect(profileX + 10, profileY + 110, 60, 16, 4)
           .fillColor('#FFD700')
           .fill();
        doc.fillColor('#8B0000')
           .font('Helvetica-Bold')
           .fontSize(8)
           .text('PARTICIPANT', profileX + 15, profileY + 113);

        // ==== Details Section ====
        const detailsX = 120;
        let currentY = 60;
        const lineHeight = 18;

        // College
        const collegeText = this._truncateText(validatedData.personalDetails.college, 25);
        this._drawDetailLine(doc, 'College:', collegeText, detailsX, currentY);
        currentY += lineHeight;
        
        // Reg. ID
        this._drawDetailLine(doc, 'Reg. ID:', validatedData.registrationId, detailsX, currentY);
        currentY += lineHeight;
        
        // Events - REMOVED: Amount line
        const eventsText = this._getEventsText(validatedData);
        if (eventsText) {
          this._drawDetailLine(doc, 'Events:', eventsText, detailsX, currentY);
          currentY += lineHeight;
        }

        // ==== QR Code Section ====
        const qrX = 290, qrY = 140, qrSize = 65;

        try {
          const qrPayload = {
            reg_id: validatedData.registrationId,
            name: validatedData.personalDetails.name,
            college: validatedData.personalDetails.college,
            events: validatedData.prelimEvents,
            main_event: validatedData.mainEvent
          };
          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
          doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize });
        } catch (qrError) {
          console.error('QR Code generation failed:', qrError);
          doc.fillColor('#FFFFFF')
             .font('Helvetica-Bold')
             .fontSize(7)
             .text('QR CODE\nUNAVAILABLE', qrX + 15, qrY + 25, { align: 'center' });
        }

        // Scan text
        doc.fillColor('#FFD700')
           .font('Helvetica-Bold')
           .fontSize(7)
           .text('SCAN TO VERIFY', qrX, qrY + qrSize + 3, { width: qrSize, align: 'center' });

        // ==== Footer ====
        doc.strokeColor('#FFD700').lineWidth(1)
           .moveTo(15, 220).lineTo(385, 220).stroke();

        doc.fillColor('#F8E9A1')
           .font('Helvetica')
           .fontSize(7)
           .text('Official ID Card • Chaitanya 2025 • Himachal Pradesh Technical University', 0, 228, { align: 'center' });

        doc.end();
      } catch (err) {
        console.error('❌ Individual ID card generation failed:', err);
        reject(err);
      }
    });
  }

  // FIXED: Team Leader ID Card without amount
  async generateTeamLeaderIDCard(data) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🎨 Generating team leader ID card for:', data.registrationId);
        
        const validatedData = this.validateRegistrationData(data);
        const doc = new PDFDocument({ size: [400, 250], margin: 0 });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // ==== Background ====
        const gradient = doc.linearGradient(0, 0, 400, 250);
        gradient.stop(0, '#7B1E1E').stop(1, '#420000');
        doc.rect(0, 0, 400, 250).fill(gradient);

        // Card border with gold line
        doc.lineWidth(3).strokeColor('#FFD700').rect(5, 5, 390, 240).stroke();

        // ==== Header ====
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(18)
           .text('CHAITANYA 2025', 0, 15, { align: 'center' });

        doc.fontSize(9)
           .fillColor('#F8E9A1')
           .text('HPTU TECHNICAL FESTIVAL', 0, 35, { align: 'center' });

        // ==== Profile Section ====
        const profileX = 20, profileY = 60;
        
        doc.circle(profileX + 40, profileY + 40, 40)
           .fillColor('#FFFFFF')
           .fill();

        const initials = (validatedData.teamLeader.name || 'TL')
          .split(' ')
          .map(w => w[0]?.toUpperCase() || '')
          .join('')
          .slice(0, 2);

        doc.fillColor('#8B0000')
           .font('Helvetica-Bold')
           .fontSize(22)
           .text(initials, profileX + 40 - doc.widthOfString(initials) / 2, profileY + 32);

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(11)
           .text(validatedData.teamLeader.name, profileX, profileY + 90, { 
             width: 80, 
             align: 'center',
             lineBreak: false
           });

        // Role badge - TEAM LEADER
        doc.roundedRect(profileX + 5, profileY + 110, 70, 16, 4)
           .fillColor('#FF6B35')
           .fill();
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(8)
           .text('TEAM LEADER', profileX + 8, profileY + 113);

        // ==== Details Section ====
        const detailsX = 120;
        let currentY = 60;
        const lineHeight = 18;

        // College
        const collegeText = this._truncateText(validatedData.teamLeader.college, 25);
        this._drawDetailLine(doc, 'College:', collegeText, detailsX, currentY);
        currentY += lineHeight;
        
        // Reg. ID
        this._drawDetailLine(doc, 'Reg. ID:', validatedData.registrationId, detailsX, currentY);
        currentY += lineHeight;
        
        // Team Name
        const teamNameText = this._truncateText(validatedData.teamName, 20);
        this._drawDetailLine(doc, 'Team:', teamNameText, detailsX, currentY);
        currentY += lineHeight;
        
        // Team ID
        this._drawDetailLine(doc, 'Team ID:', validatedData.teamId, detailsX, currentY);
        currentY += lineHeight;
        
        // Events - REMOVED: Amount line
        const eventsText = this._getEventsText(validatedData, 'team_leader');
        if (eventsText) {
          this._drawDetailLine(doc, 'Events:', eventsText, detailsX, currentY);
        }

        // ==== QR Code ====
        const qrX = 290, qrY = 140, qrSize = 65;

        try {
          const qrPayload = {
            team_id: validatedData.teamId,
            team_name: validatedData.teamName,
            type: 'team_leader',
            registration_id: validatedData.registrationId,
            name: validatedData.teamLeader.name,
            main_event: validatedData.teamLeader.mainEvent
          };
          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
          doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize });
        } catch (qrError) {
          console.error('QR Code generation failed:', qrError);
          doc.fillColor('#FFFFFF')
             .font('Helvetica-Bold')
             .fontSize(7)
             .text('QR CODE\nUNAVAILABLE', qrX + 15, qrY + 25, { align: 'center' });
        }

        doc.fillColor('#FFD700')
           .font('Helvetica-Bold')
           .fontSize(7)
           .text('SCAN TO VERIFY', qrX, qrY + qrSize + 3, { width: qrSize, align: 'center' });

        // ==== Footer ====
        doc.strokeColor('#FFD700').lineWidth(1)
           .moveTo(15, 220).lineTo(385, 220).stroke();

        doc.fillColor('#F8E9A1')
           .font('Helvetica')
           .fontSize(7)
           .text('Official ID Card • Chaitanya 2025 • Himachal Pradesh Technical University', 0, 228, { align: 'center' });

        doc.end();

      } catch (error) {
        console.error('❌ Team leader ID card generation failed:', error);
        reject(error);
      }
    });
  }

  // FIXED: Team Member ID Card without amount
  async generateTeamMemberIDCard(data) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🎨 Generating team member ID card for:', data.registrationId);
        
        const validatedData = this.validateRegistrationData(data);
        const doc = new PDFDocument({ size: [400, 250], margin: 0 });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // ==== Background ====
        const gradient = doc.linearGradient(0, 0, 400, 250);
        gradient.stop(0, '#7B1E1E').stop(1, '#420000');
        doc.rect(0, 0, 400, 250).fill(gradient);

        // Card border with gold line
        doc.lineWidth(3).strokeColor('#FFD700').rect(5, 5, 390, 240).stroke();

        // ==== Header ====
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(18)
           .text('CHAITANYA 2025', 0, 15, { align: 'center' });

        doc.fontSize(9)
           .fillColor('#F8E9A1')
           .text('HPTU TECHNICAL FESTIVAL', 0, 35, { align: 'center' });

        // ==== Profile Section ====
        const profileX = 20, profileY = 60;
        
        doc.circle(profileX + 40, profileY + 40, 40)
           .fillColor('#FFFFFF')
           .fill();

        const initials = (validatedData.personalDetails.name || 'TM')
          .split(' ')
          .map(w => w[0]?.toUpperCase() || '')
          .join('')
          .slice(0, 2);

        doc.fillColor('#8B0000')
           .font('Helvetica-Bold')
           .fontSize(22)
           .text(initials, profileX + 40 - doc.widthOfString(initials) / 2, profileY + 32);

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(11)
           .text(validatedData.personalDetails.name, profileX, profileY + 90, { 
             width: 80, 
             align: 'center',
             lineBreak: false
           });

        // Role badge - TEAM MEMBER
        doc.roundedRect(profileX + 5, profileY + 110, 75, 16, 4)
           .fillColor('#4ECDC4')
           .fill();
        doc.fillColor('#000000')
           .font('Helvetica-Bold')
           .fontSize(8)
           .text('TEAM MEMBER', profileX + 8, profileY + 113);

        // ==== Details Section ====
        const detailsX = 120;
        let currentY = 60;
        const lineHeight = 18;

        // College
        const collegeText = this._truncateText(validatedData.personalDetails.college, 25);
        this._drawDetailLine(doc, 'College:', collegeText, detailsX, currentY);
        currentY += lineHeight;
        
        // Reg. ID
        this._drawDetailLine(doc, 'Reg. ID:', validatedData.registrationId, detailsX, currentY);
        currentY += lineHeight;
        
        // Team Name
        const teamNameText = this._truncateText(validatedData.teamName, 20);
        this._drawDetailLine(doc, 'Team:', teamNameText, detailsX, currentY);
        currentY += lineHeight;
        
        // Team ID
        this._drawDetailLine(doc, 'Team ID:', validatedData.teamId, detailsX, currentY);
        currentY += lineHeight;
        
        // Events - REMOVED: Amount line
        const eventsText = this._getEventsText(validatedData, 'team_member');
        if (eventsText) {
          this._drawDetailLine(doc, 'Events:', eventsText, detailsX, currentY);
        }

        // ==== QR Code ====
        const qrX = 290, qrY = 140, qrSize = 65;

        try {
          const qrPayload = {
            team_id: validatedData.teamId,
            team_name: validatedData.teamName,
            type: 'team_member',
            registration_id: validatedData.registrationId,
            name: validatedData.personalDetails.name,
            member_index: validatedData.memberIndex,
            main_event: validatedData.personalDetails.mainEvent
          };
          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
          doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize });
        } catch (qrError) {
          console.error('QR Code generation failed:', qrError);
          doc.fillColor('#FFFFFF')
             .font('Helvetica-Bold')
             .fontSize(7)
             .text('QR CODE\nUNAVAILABLE', qrX + 15, qrY + 25, { align: 'center' });
        }

        doc.fillColor('#FFD700')
           .font('Helvetica-Bold')
           .fontSize(7)
           .text('SCAN TO VERIFY', qrX, qrY + qrSize + 3, { width: qrSize, align: 'center' });

        // ==== Footer ====
        doc.strokeColor('#FFD700').lineWidth(1)
           .moveTo(15, 220).lineTo(385, 220).stroke();

        doc.fillColor('#F8E9A1')
           .font('Helvetica')
           .fontSize(7)
           .text('Official ID Card • Chaitanya 2025 • Himachal Pradesh Technical University', 0, 228, { align: 'center' });

        doc.end();

      } catch (error) {
        console.error('❌ Team member ID card generation failed:', error);
        reject(error);
      }
    });
  }

  // Helper method to draw detail lines
  _drawDetailLine(doc, label, value, x, y, valueColor = '#FFFFFF') {
    // Label in gold
    doc.fillColor('#FFD700')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(label, x, y);
    
    // Value in white (or specified color)
    const valueX = x + 50;
    doc.fillColor(valueColor)
       .font('Helvetica')
       .fontSize(9)
       .text(value, valueX, y, {
         width: 140,
         align: 'left'
       });
  }

  // Helper method to truncate long text
  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Helper method to get events text (Main Event or Prelim Events)
  _getEventsText(data, type = 'individual') {
    let events = [];
    let mainEvent = '';

    if (type === 'individual') {
      events = data.prelimEvents || [];
      mainEvent = data.mainEvent || '';
    } else if (type === 'team_leader') {
      events = data.teamLeader?.prelimEvents || [];
      mainEvent = data.teamLeader?.mainEvent || '';
    } else if (type === 'team_member') {
      events = data.personalDetails?.prelimEvents || [];
      mainEvent = data.personalDetails?.mainEvent || '';
    }

    // If main event exists, show only main event
    if (mainEvent && mainEvent.trim() !== '') {
      return mainEvent;
    }
    
    // Otherwise show prelim events (truncated if too long)
    if (events.length > 0) {
      const eventsText = events.join(', ');
      return this._truncateText(eventsText, 25);
    }
    
    return '';
  }

  async sendIndividualConfirmation(registrationData) {
    try {
      console.log('📧 [EMAIL DEBUG] Starting individual confirmation for:', registrationData.personalDetails.email);
      console.log('📧 [EMAIL DEBUG] Registration data:', {
        id: registrationData.registrationId,
        name: registrationData.personalDetails.name
      });
      
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
      return {
        success: false,
        message: 'Failed to send confirmation: ' + error.message
      };
    }
  }

  async sendTeamConfirmation(registrationData) {
    try {
      console.log('📧 Sending team confirmation to:', registrationData.teamLeader.email);
      
      const quickResult = await this.sendQuickConfirmation(registrationData);
      
      await this.guaranteePDFDelivery(registrationData);
      
      for (let i = 0; i < registrationData.teamMembers.length; i++) {
        const member = registrationData.teamMembers[i];
        const memberRegistrationId = `${registrationData.teamId}-M${i + 1}`;
        
        await this.guaranteePDFDelivery({
          ...registrationData,
          registrationType: 'team_member',
          registrationId: memberRegistrationId,
          teamId: registrationData.teamId,
          personalDetails: member,
          memberIndex: i + 1
        });
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
      registrationId: 'CH2025-IND-TEST',
      totalAmount: 400,
      qrData: {
        reg_id: 'CH2025-IND-TEST',
        name: 'Test Student',
        type: 'individual',
        events: ['Code Forge', 'Robo Rampage']
      }
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
      registrationId: 'CH2025-IND-TEST',
      totalAmount: 400,
      qrData: {
        reg_id: 'CH2025-IND-TEST',
        name: 'Test Student',
        type: 'individual',
        events: ['Code Forge', 'Robo Rampage']
      }
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
      console.error('Stack trace:', error.stack);
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

module.exports = new EmailService();