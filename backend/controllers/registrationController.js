const RegistrationService = require('../services/registrationService');
const GoogleSheetsService = require('../services/googleSheetsService');
const EmailService = require('../services/emailService');
const OTPService = require('../services/otpService');
const PaymentService = require('../services/paymentService'); 

class RegistrationController {
  
  // Phase 1: Start registration with personal details
  async startRegistration(req, res) {
    try {
      const { name, email, phone, college, registrationType } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone || !college || !registrationType) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: name, email, phone, college, registrationType'
        });
      }

      // Validate registration type
      if (!['individual', 'team'].includes(registrationType)) {
        return res.status(400).json({
          success: false,
          message: 'Registration type must be individual or team'
        });
      }

      // Validate personal details
      const personalDetails = { name, email, phone, college };
      const validation = RegistrationService.validatePersonalDetails(personalDetails);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message
        });
      }

      // Generate and send OTP
      const otpResult = await OTPService.generateAndSendOTP(email, phone);
      
      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP'
        });
      }

      // Create registration session
      const sessionId = RegistrationService.createRegistrationSession(personalDetails, registrationType, otpResult.otp);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        sessionId: sessionId,
        nextPhase: 'otp_verification'
      });

    } catch (error) {
      console.error('Error in startRegistration:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Phase 1.5: OTP Verification
  async verifyOTP(req, res) {
    try {
      const { sessionId, otp } = req.body;
      
      if (!sessionId || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'Session ID and OTP are required' 
        });
      }

      // Verify OTP
      const verificationResult = RegistrationService.verifyOTP(sessionId, otp);
      
      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message
        });
      }

      const session = RegistrationService.getSession(sessionId);
      
      res.json({
        success: true,
        message: 'OTP verified successfully',
        sessionId: sessionId,
        registrationType: session.registrationType,
        nextPhase: session.registrationType === 'individual' ? 'individual_setup' : 'team_setup'
      });

    } catch (error) {
      console.error('Error in verifyOTP:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Phase 2: Individual Path - Select prelim events
  async setupIndividual(req, res) {
    try {
      const { sessionId, prelimEvents } = req.body; // ✅ REMOVE totalAmount from here
      
      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Session ID is required' });
      }

      if (!prelimEvents || !Array.isArray(prelimEvents)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Prelim events array is required' 
        });
      }

      // ✅ FIXED: Don't pass totalAmount - let service calculate it
      const individualData = RegistrationService.setupIndividualEvents(sessionId, prelimEvents);

      res.json({
        success: true,
        message: 'Individual setup completed successfully',
        sessionId: sessionId,
        nextPhase: 'review',
        individualData: {
          personalDetails: individualData.personalDetails,
          prelimEvents: individualData.prelimEvents,
          totalAmount: individualData.totalAmount // ✅ This now has the correct amount
        }
      });

    } catch (error) {
      console.error('Error in setupIndividual:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Phase 2: Team Path - Setup team with members
  async setupTeam(req, res) {
    try {
      const { sessionId, teamName, mainEvent, teamMembers, leaderPrelimEvents } = req.body;
      
      console.log('🔍 [ROUTE DEBUG] Team setup request:', {
        sessionId,
        teamName,
        mainEvent,
        teamMembersCount: teamMembers?.length,
        leaderPrelimEvents // ✅ Check if this is received
      });

      if (!sessionId || !teamName || !mainEvent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Session ID, team name, and main event are required' 
        });
      }

      // Validate main event selection
      if (!['Hackathon', 'Accurate Predictions'].includes(mainEvent)) {
        return res.status(400).json({
          success: false,
          message: 'Please select one main event (Hackathon or Accurate Predictions)'
        });
      }

      // Validate team members if provided
      if (teamMembers && Array.isArray(teamMembers)) {
        for (const member of teamMembers) {
          const validation = RegistrationService.validatePersonalDetails(member);
          if (!validation.valid) {
            return res.status(400).json({ 
              success: false, 
              message: `Invalid data for team member: ${validation.message}` 
            });
          }
        }
      }

      // ✅ FIXED: Setup team with leader prelim events
      const teamData = RegistrationService.setupTeamDetails(
        sessionId, 
        teamName, 
        mainEvent, 
        teamMembers || [],
        leaderPrelimEvents || [] // ✅ Pass leader prelim events
      );

      console.log('✅ [ROUTE DEBUG] Team setup completed:', {
        teamLeader: teamData.teamLeader.name,
        leaderPrelimEvents: teamData.teamLeader.prelimEvents,
        teamMembers: teamData.teamMembers.length
      });

      res.json({
        success: true,
        message: 'Team setup completed successfully',
        sessionId: sessionId,
        nextPhase: 'review',
        teamData: {
          teamLeader: teamData.teamLeader,
          teamName: teamData.teamName,
          mainEvent: teamData.mainEvent,
          teamMembers: teamData.teamMembers,
          totalAmount: teamData.totalAmount,
          teamSize: teamData.teamSize
        }
      });

    } catch (error) {
      console.error('Error in setupTeam:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }


  // Phase 3: Review registration
  async reviewRegistration(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Session ID is required' });
      }

      const registrationData = RegistrationService.getRegistrationReview(sessionId);

      res.json({
        success: true,
        message: 'Registration review completed successfully',
        sessionId: sessionId,
        nextPhase: 'payment',
        registrationData: registrationData
      });

    } catch (error) {
      console.error('Error in reviewRegistration:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Phase 4: Complete registration with payment
async completeRegistration(req, res) {
  try {
    const { sessionId, paymentMethod = 'razorpay' } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const session = RegistrationService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    console.log('🔍 DEBUG - Session before completion:', session);

    // Complete registration first (this stores data locally)
    console.log('💾 Starting registration completion...');
    const registrationResult = RegistrationService.completeRegistration(sessionId, paymentResult, paymentMethod);
    console.log('✅ Registration completion result:', registrationResult);
    
    // ✅ FIXED: Separate Google Sheets and Email into independent processes
    let sheetsResult = { success: false, message: 'Not attempted' };
    let emailResult = { success: false, message: 'Not attempted' };

    // 1. Save to Google Sheets (don't block registration on this)
    console.log('💾 Attempting to save to Google Sheets...');
    try {
      sheetsResult = await GoogleSheetsService.saveRegistration(registrationResult.finalRegistration);
      console.log('📊 Google Sheets save result:', sheetsResult);
    } catch (sheetsError) {
      console.error('❌ Google Sheets error:', sheetsError);
      sheetsResult = { success: false, message: sheetsError.message };
    }

    // 2. Send confirmation email (don't block registration on this)
    console.log('📧 Attempting to send confirmation email...');
    try {
      if (session.registrationType === 'individual') {
        emailResult = await EmailService.sendIndividualConfirmation(registrationResult.finalRegistration);
      } else {
        emailResult = await EmailService.sendTeamConfirmation(registrationResult.finalRegistration);
      }
      console.log('📧 Email sending result:', emailResult);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      emailResult = { success: false, message: emailError.message };
    }

    // ✅ SUCCESS: Registration is always successful even if sheets/email fail
    res.json({
      success: true,
      message: `${session.registrationType.charAt(0).toUpperCase() + session.registrationType.slice(1)} registration completed successfully!`,
      registrationId: registrationResult.registrationId,
      teamId: registrationResult.teamId,
      paymentStatus: 'completed',
      amount: session.totalAmount,
      registrationType: session.registrationType,
      data: registrationResult.finalRegistration,
      // ✅ ADDED: Service status for debugging
      services: {
        googleSheets: sheetsResult,
        email: emailResult
      },
      // ✅ IMPORTANT: Tell frontend that registration is complete
      registrationComplete: true
    });

  } catch (error) {
    console.error('❌ Error in completeRegistration:', error);
    console.error('🔍 Error details:', error.message);
    console.error('📝 Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during registration completion',
      error: error.message 
    });
  }
}

  // Get all registrations (admin function)
  async getAllRegistrations(req, res) {
    try {
      const sheetsResult = await GoogleSheetsService.getAllRegistrations();
      
      if (sheetsResult.success) {
        res.json({
          success: true,
          count: sheetsResult.count,
          data: sheetsResult.data,
          source: 'google_sheets'
        });
      } else {
        const allRegs = RegistrationService.getAllRegistrations();
        res.json({
          success: true,
          count: allRegs.length,
          data: allRegs,
          source: 'local_storage',
          message: 'Using local storage - Google Sheets not available'
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching registrations' });
    }
  }

  // Clean up old sessions to prevent memory leaks
  cleanupOldSessions() {
    RegistrationService.cleanupOldSessions();
  }
}

module.exports = new RegistrationController();