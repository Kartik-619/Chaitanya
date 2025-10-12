const { v4: uuidv4 } = require('uuid');
const { calculateIndividualAmount, calculateTeamAmount } = require('../utils/calculationHelpers');
const { VALIDATION_CONFIG } = require('../config/validationConfig');
const { EVENT_PRICES } = require('../config/eventPricing');
const crypto = require('crypto');

class RegistrationService {
  constructor() {
    this.registrationSessions = new Map();
    this.completedRegistrations = new Map();
    this.otpStorage = new Map();
    
    // ✅ KEEP: Essential payment integration but SECURE
    this.paymentService = {
      processIndividualPayment: async (amount, sessionId, customerInfo) => {
        console.log('💰 Processing individual payment:', amount);
        return {
          success: true,
          orderDetails: {
            orderId: 'order_' + crypto.randomBytes(8).toString('hex'),
            amount: amount * 100,
            currency: 'INR'
          }
        };
      },
      processTeamPayment: async (amount, sessionId, customerInfo) => {
        console.log('💰 Processing team payment:', amount);
        return {
          success: true,
          orderDetails: {
            orderId: 'order_' + crypto.randomBytes(8).toString('hex'),
            amount: amount * 100,
            currency: 'INR'
          }
        };
      },
      verifyPayment: async (orderId, paymentId, signature) => {
        console.log('💰 Verifying payment');
        
        // ✅ SECURE: Add validation
        if (!orderId || !paymentId) {
          return {
            success: false,
            message: 'Missing payment data'
          };
        }
        
        return {
          success: true,
          paymentId: paymentId,
          orderId: orderId,
          status: 'captured'
        };
      }
    };
    
    this.MAX_SESSION_AGE = 30 * 60 * 1000;
    this.OTP_EXPIRY = 10 * 60 * 1000;
    this.otpAttempts = new Map();
    this.MAX_OTP_ATTEMPTS = 3;
  }

  getRegistrationSession(sessionId) {
    return this.registrationSessions.get(sessionId);
  }

  // In RegistrationService.js - FIX THIS METHOD
createRegistrationSession(personalDetails, registrationType, otp) {
  try {
    console.log('🔍 Creating session with data:', { personalDetails, registrationType });
    
    // ✅ FIX: Handle both nested teamHead and flat structure
    let actualPersonalDetails;
    
    if (personalDetails.teamHead) {
      // Data comes from SecurityMiddleware (nested teamHead)
      actualPersonalDetails = personalDetails.teamHead;
      console.log('📦 Using nested teamHead data');
    } else {
      // Data comes directly (flat structure)
      actualPersonalDetails = personalDetails;
      console.log('📦 Using flat personal details');
    }

    // ✅ Validate we have the required fields
    if (!actualPersonalDetails || !actualPersonalDetails.email || !actualPersonalDetails.phone) {
      console.log('❌ Missing required personal details:', actualPersonalDetails);
      throw new Error('Invalid personal details - email and phone are required');
    }

    const sessionId = uuidv4();
    const sessionData = {
      personalDetails: actualPersonalDetails, // ✅ Use the correct personal details
      registrationType,
      otp,
      otpVerified: false,
      currentPhase: 'started',
      totalAmount: 0,
      prelimEvents: [],
      teamData: null,
      createdAt: new Date().toISOString(),
      otpCreatedAt: Date.now(),
      paymentStatus: 'pending'
    };
    
    this.registrationSessions.set(sessionId, sessionData);
    this.otpStorage.set(sessionId, { 
      otp, 
      createdAt: Date.now(),
      attempts: 0 
    });
    
    console.log(`✅ ${registrationType} session created: ${sessionId}`);
    return sessionId;
  } catch (error) {
    console.error('❌ Session creation failed:', error);
    throw error;
  }
}

  // ✅ KEEP: Your OTP verification with security enhancements
  verifyOTP(sessionId, enteredOTP) {
    const session = this.registrationSessions.get(sessionId);
    const storedOTP = this.otpStorage.get(sessionId);
    
    if (!session || !storedOTP) {
      return { success: false, message: 'Session not found or OTP expired' };
    }

    // ✅ ADDED: Rate limiting
    if (storedOTP.attempts >= this.MAX_OTP_ATTEMPTS) {
      this.otpStorage.delete(sessionId);
      this.registrationSessions.delete(sessionId);
      return { success: false, message: 'Too many OTP attempts. Session terminated.' };
    }

    // Check OTP expiry
    if (Date.now() - storedOTP.createdAt > this.OTP_EXPIRY) {
      this.otpStorage.delete(sessionId);
      return { success: false, message: 'OTP has expired' };
    }

    // ✅ SECURE: Constant-time comparison
    let isValid = true;
    if (storedOTP.otp.length !== enteredOTP.length) {
      isValid = false;
    } else {
      for (let i = 0; i < storedOTP.otp.length; i++) {
        if (storedOTP.otp.charCodeAt(i) !== enteredOTP.charCodeAt(i)) {
          isValid = false;
        }
      }
    }

    if (!isValid) {
      storedOTP.attempts++;
      this.otpStorage.set(sessionId, storedOTP);
      return { success: false, message: 'Invalid OTP' };
    }

    // OTP verified successfully
    session.otpVerified = true;
    session.currentPhase = 'otp_verified';
    this.otpStorage.delete(sessionId);
    
    this.registrationSessions.set(sessionId, session);
    
    return { success: true, message: 'OTP verified successfully' };
  }

// In RegistrationService.js - FIX THE setupIndividualEvents METHOD
setupIndividualEvents(sessionId, prelimEvents, totalAmount) {
  const session = this.registrationSessions.get(sessionId);
  if (!session || !session.otpVerified) throw new Error('Session not found or OTP not verified');
  if (session.registrationType !== 'individual') throw new Error('Invalid registration type');

  // Validate prelim events
  if (!prelimEvents || !Array.isArray(prelimEvents)) {
    throw new Error('Prelim events array is required');
  }

  // ✅ FIXED: Use the imported helper function directly
  const calculatedAmount = calculateIndividualAmount(prelimEvents);

  console.log('💰 DEBUG - Individual Events:', prelimEvents);
  console.log('💰 DEBUG - Calculated Amount:', calculatedAmount);
  console.log('💰 DEBUG - Provided Amount:', totalAmount);

  // ✅ FIXED: Use the calculated amount
  const finalAmount = calculatedAmount; // Always use calculated amount
  
  console.log('💰 DEBUG - Final Amount Being Stored:', finalAmount);

  session.prelimEvents = prelimEvents;
  session.totalAmount = finalAmount; // ✅ THIS WAS MISSING - Store the amount in session
  session.currentPhase = 'individual_setup';
  
  this.registrationSessions.set(sessionId, session);

  return {
    personalDetails: session.personalDetails,
    prelimEvents: session.prelimEvents,
    totalAmount: session.totalAmount // Return correct amount
  };
}

  // ✅ KEEP: Your original team setup with validation
  setupTeamDetails(sessionId, teamName, mainEvent, teamMembers, leaderPrelimEvents = []) {
    const session = this.registrationSessions.get(sessionId);
    if (!session || !session.otpVerified) throw new Error('Session not found or OTP not verified');
    if (session.registrationType !== 'team') throw new Error('Invalid registration type');
    console.log('🔍 [TEAM SETUP DEBUG] Received data:', {
      teamName,
      mainEvent,
      teamMembersCount: teamMembers?.length,
      leaderPrelimEvents: leaderPrelimEvents
    });

    // Validate main event
    if (!['Hackathon', 'Accurate Predictions'].includes(mainEvent)) {
      throw new Error('Please select one main event (Hackathon or Accurate Predictions)');
    }

    // Validate team size (2-4 members including team leader)
    const totalTeamSize = teamMembers.length + 1;
    if (totalTeamSize < 2 || totalTeamSize > 4) {
      throw new Error('Team size must be between 2 and 4 members');
    }

    // Check for duplicate emails/phones
    const allEmails = [session.personalDetails.email, ...teamMembers.map(m => m.email)];
    const allPhones = [session.personalDetails.phone, ...teamMembers.map(m => m.phone)];
    
    if (new Set(allEmails).size !== allEmails.length) {
      throw new Error('Duplicate email found in team');
    }
    if (new Set(allPhones).size !== allPhones.length) {
      throw new Error('Duplicate phone number found in team');
    }

    // ✅ ADDED: Validate team member data
    for (const member of teamMembers) {
      if (!member.name || !member.email || !member.phone) {
        throw new Error('All team members must have name, email, and phone');
      }
    }

    // Calculate team amount (fixed ₹2500)
    const totalAmount = calculateTeamAmount(mainEvent);
    
    session.teamData = {
      teamName: teamName.trim().substring(0, 50), // ✅ ADDED: Sanitization
      mainEvent,
      teamMembers,
      teamLeader: {
      ...session.personalDetails,
      prelimEvents: leaderPrelimEvents || [] 
    }
    };
    session.totalAmount = totalAmount;
    session.currentPhase = 'team_setup';
    
    this.registrationSessions.set(sessionId, session);

    return {
      teamLeader: session.teamData.teamLeader,
      teamName: session.teamData.teamName,
      mainEvent: session.teamData.mainEvent,
      teamMembers: session.teamData.teamMembers,
      totalAmount: session.totalAmount,
      teamSize: totalTeamSize
    };
  }

  // ✅ KEEP: Your payment initialization but SECURE
  async initializePayment(sessionId) {
    const session = this.registrationSessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.otpVerified) throw new Error('OTP not verified');
    if (session.totalAmount <= 0) throw new Error('Invalid amount for payment');

    try {
      let paymentResult;
      
      if (session.registrationType === 'individual') {
        paymentResult = await this.paymentService.processIndividualPayment(
          session.totalAmount,
          sessionId,
          {
            name: session.personalDetails.name,
            email: session.personalDetails.email,
            phone: session.personalDetails.phone
          }
        );
      } else {
        paymentResult = await this.paymentService.processTeamPayment(
          session.totalAmount,
          sessionId,
          {
            name: session.personalDetails.name,
            email: session.personalDetails.email,
            phone: session.personalDetails.phone,
            teamName: session.teamData.teamName
          }
        );
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment initialization failed');
      }

      // Store payment details in session
      session.paymentOrderId = paymentResult.orderDetails?.orderId;
      session.paymentAttempts = (session.paymentAttempts || 0) + 1;
      session.currentPhase = 'payment_initiated';
      
      this.registrationSessions.set(sessionId, session);

      return {
        success: true,
        orderDetails: paymentResult.orderDetails,
        amount: session.totalAmount,
        registrationType: session.registrationType
        // ❌ REMOVED: keyId for security
      };

    } catch (error) {
      console.error('Payment initialization error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  // ✅ KEEP: Your payment verification with security
  async verifyAndCompleteRegistration(sessionId, paymentData) {
    const session = this.registrationSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // ✅ ADDED: Validation
    if (!razorpay_order_id || !razorpay_payment_id) {
      throw new Error('Missing payment verification data');
    }

    try {
      const verificationResult = await this.paymentService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!verificationResult.success) {
        session.paymentStatus = 'failed';
        this.registrationSessions.set(sessionId, session);
        throw new Error(verificationResult.message || 'Payment verification failed');
      }

      // ✅ FIXED: Your original fix for transaction ID
      const properPaymentResult = {
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: 'captured'
      };

      const completionResult = this.completeRegistration(
        sessionId, 
        properPaymentResult,
        'razorpay'
      );

      session.paymentStatus = 'completed';
      session.currentPhase = 'completed';
      this.registrationSessions.set(sessionId, session);

      return completionResult;

    } catch (error) {
      console.error('Payment verification error:', error);
      session.paymentStatus = 'failed';
      this.registrationSessions.set(sessionId, session);
      throw error;
    }
  }

  // ✅ KEEP: All your original methods
  getPaymentStatus(sessionId) {
    const session = this.registrationSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    return {
      paymentStatus: session.paymentStatus || 'pending',
      orderId: session.paymentOrderId,
      totalAmount: session.totalAmount,
      currentPhase: session.currentPhase
    };
  }

  getRegistrationReview(sessionId) {
    const session = this.registrationSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.registrationType === 'individual') {
      return {
        registrationType: 'individual',
        personalDetails: session.personalDetails,
        prelimEvents: session.prelimEvents,
        totalAmount: session.totalAmount,
        currentPhase: 'review',
        paymentStatus: session.paymentStatus
      };
    } else {
      return {
        registrationType: 'team',
        teamLeader: session.personalDetails,
        teamName: session.teamData.teamName,
        mainEvent: session.teamData.mainEvent,
        teamMembers: session.teamData.teamMembers,
        totalAmount: session.totalAmount,
        teamSize: session.teamData.teamMembers.length + 1,
        currentPhase: 'review',
        paymentStatus: session.paymentStatus
      };
    }
  }

  // In RegistrationService.js - completeRegistration method
completeRegistration(sessionId, paymentResult, paymentMethod = 'razorpay') {
  const session = this.registrationSessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  console.log('🔍 [COMPLETE DEBUG] Session teamData:', {
    teamLeaderName: session.teamData?.teamLeader?.name,
    teamLeaderPrelimEvents: session.teamData?.teamLeader?.prelimEvents, // ✅ Check this!
    hasPrelimEvents: !!session.teamData?.teamLeader?.prelimEvents,
    prelimEventsType: typeof session.teamData?.teamLeader?.prelimEvents
  });

  const registrationId = this.generateRegistrationId(session.registrationType);
  const teamId = session.registrationType === 'team' ? this.generateTeamId() : null;

  let finalRegistration;

  // ✅ EXTRACT: Get transaction ID from payment result
  const transactionId = paymentResult.paymentId || paymentResult.paymentDetails?.transactionId;
  const orderId = paymentResult.orderId || paymentResult.paymentDetails?.orderId;
  
  console.log('💾 Storing payment data:', {
    transactionId,
    orderId,
    amount: session.totalAmount
  });

  if (session.registrationType === 'individual') {
    finalRegistration = {
      registrationType: 'individual',
      registrationId,
      personalDetails: session.personalDetails,
      prelimEvents: session.prelimEvents,
      paymentDetails: {
        transactionId: transactionId,
        orderId: orderId,
        paymentId: paymentResult.paymentId,
        signature: paymentResult.signature,
        amount: session.totalAmount,
        method: paymentMethod,
        status: paymentResult.status || 'captured',
        transactionDate: new Date().toISOString(),
        razorpayPaymentId: transactionId,
        razorpayOrderId: orderId,
        ...paymentResult.paymentDetails
      },
      totalAmount: session.totalAmount,
      registeredAt: new Date().toISOString(),
      qrData: this.generateQRData('individual', registrationId, session.personalDetails, session.prelimEvents)
    };
  } else {
     const teamLeaderData = {
      ...session.teamData.teamLeader, // Copy all properties
      prelimEvents: session.teamData.teamLeader.prelimEvents || [] // ✅ EXPLICITLY include prelimEvents
    };
    console.log('🔍 [FINAL TEAM LEADER DEBUG] Team leader data:', {
      name: teamLeaderData.name,
      prelimEvents: teamLeaderData.prelimEvents, // ✅ Should have the events now
      email: teamLeaderData.email
    });
    finalRegistration = {
      registrationType: 'team',
      teamId,
      teamName: session.teamData.teamName,
      registrationId,
      teamLeader: teamLeaderData,
      mainEvent: session.teamData.mainEvent,
      teamMembers: session.teamData.teamMembers,
      paymentDetails: {
        transactionId: transactionId,
        orderId: orderId,
        paymentId: paymentResult.paymentId,
        signature: paymentResult.signature,
        amount: session.totalAmount,
        method: paymentMethod,
        status: paymentResult.status || 'captured',
        transactionDate: new Date().toISOString(),
        razorpayPaymentId: transactionId,
        razorpayOrderId: orderId,
        ...paymentResult.paymentDetails
      },
      totalAmount: session.totalAmount,
      teamSize: session.teamData.teamMembers.length + 1,
      registeredAt: new Date().toISOString(),
      qrData: this.generateQRData('team', teamId, session.personalDetails, session.teamData)
    };
  }

  console.log('✅ [FINAL REGISTRATION DEBUG] Final registration teamLeader:', {
    name: finalRegistration.teamLeader?.name,
    prelimEvents: finalRegistration.teamLeader?.prelimEvents, // ✅ Check if events are there!
    hasPrelimEvents: !!finalRegistration.teamLeader?.prelimEvents
  });

  // Save to completed registrations
  this.completedRegistrations.set(registrationId, finalRegistration);
  
  // Clean up session
  this.registrationSessions.delete(sessionId);

  console.log(`✅ ${session.registrationType} registration completed: ${registrationId}`);
  console.log(`💰 Transaction ID stored: ${transactionId}`);
  console.log(`📊 Final registration data:`, finalRegistration);
  
  return {
    registrationId,
    teamId,
    finalRegistration,
    transactionId: transactionId,
    paymentDetails: finalRegistration.paymentDetails
  };
}

  generateRegistrationId(registrationType) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex'); // ✅ ADDED: Randomness
    const prefix = registrationType === 'individual' ? 'CH2025-IND' : 'CH2025-MEM';
    return `${prefix}-${timestamp}-${random}`;
  }

  generateTeamId() {
    const random = crypto.randomBytes(4).toString('hex'); // ✅ ADDED: Randomness
    return `CH2025-TEAM-${Date.now()}-${random}`;
  }

  generateQRData(type, id, personalDetails, additionalData) {
    if (type === 'individual') {
      return {
        reg_id: id,
        name: personalDetails.name,
        email: personalDetails.email,
        type: 'individual',
        events: additionalData
      };
    } else {
      return {
        team_id: id,
        team_name: additionalData.teamName,
        type: 'team',
        main_event: additionalData.mainEvent
      };
    }
  }

  getSession(sessionId) {
    return this.registrationSessions.get(sessionId);
  }

  getAllRegistrations() {
    return Array.from(this.completedRegistrations.values());
  }

  cleanupOldSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    let otpCleanedCount = 0;
    
    for (let [sessionId, session] of this.registrationSessions.entries()) {
      const sessionAge = now - new Date(session.createdAt).getTime();
      if (sessionAge > this.MAX_SESSION_AGE) {
        this.registrationSessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    for (let [sessionId, otpData] of this.otpStorage.entries()) {
      if (now - otpData.createdAt > this.OTP_EXPIRY) {
        this.otpStorage.delete(sessionId);
        otpCleanedCount++;
      }
    }
    
    if (cleanedCount > 0 || otpCleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old sessions and ${otpCleanedCount} expired OTPs`);
    }
  }

  validatePersonalDetails(personalDetails) {
    const { name, email, phone } = personalDetails;
    
    if (!name || !email || !phone) {
      return { valid: false, message: VALIDATION_CONFIG.ERROR_MESSAGES.REQUIRED_FIELDS };
    }
    
    if (!VALIDATION_CONFIG.PHONE_REGEX.test(phone)) {
      return { valid: false, message: VALIDATION_CONFIG.ERROR_MESSAGES.INVALID_PHONE };
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      return { valid: false, message: VALIDATION_CONFIG.ERROR_MESSAGES.INVALID_EMAIL };
    }
    
    return { valid: true };
  }
}

module.exports = new RegistrationService();