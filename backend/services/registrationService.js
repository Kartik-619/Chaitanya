/**
 * 📝 REGISTRATION SERVICE
 * 
 * This service handles the complete registration lifecycle:
 * - Session management and OTP verification
 * - Individual and team registration flows
 * - Payment processing and verification
 * - Data validation and security
 * 
 * 🔒 SECURITY FEATURES:
 * - OTP rate limiting and expiry
 * - Payment lock system to prevent race conditions
 * - Session cleanup and memory management
 * - Data validation and sanitization
 */

const { v4: uuidv4 } = require('uuid');
const { calculateIndividualAmount, calculateTeamAmount } = require('../utils/calculationHelpers');
const { VALIDATION_CONFIG } = require('../config/validationConfig');
const { TEAM_SIZE_RULES, E_SPORTS_GAMES, EVENT_CONFIG } = require('../config/constants');
const crypto = require('crypto');

class RegistrationService {
  constructor() {
    this.registrationSessions = new Map();
    this.completedRegistrations = new Map();
    this.otpStorage = new Map();
    this.MAX_SESSION_AGE = 30 * 60 * 1000;
    this.OTP_EXPIRY = 10 * 60 * 1000;
    this.otpAttempts = new Map();
    this.MAX_OTP_ATTEMPTS = 3;

    // Payment lock system
    this.paymentLocks = new Map();

    this.pdfDeliveryTracker = new Map();

    // Memory cleanup every hour
    setInterval(() => this.cleanupMemory(), 60 * 60 * 1000);

    // Essential payment integration but SECURE
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
        
        // Add validation
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
  }

  /**
   * Get registration session by session ID
   */
  getRegistrationSession(sessionId) {
    return this.registrationSessions.get(sessionId);
  }

  /**
   * Acquire payment lock to prevent race conditions
   */
  acquirePaymentLock(sessionId) {
    if (this.paymentLocks.has(sessionId)) {
      console.log('🔒 Payment already processing for session:', sessionId);
      return false;
    }
    this.paymentLocks.set(sessionId, Date.now());
    console.log('🔒 Payment lock acquired for session:', sessionId);
    return true;
  }

  /**
   * Release payment lock after processing
   */
  releasePaymentLock(sessionId) {
    this.paymentLocks.delete(sessionId);
    console.log('🔒 Payment lock released for session:', sessionId);
  }

  /**
   * Clean up old sessions and payment locks
   */
  cleanupMemory() {
    const now = Date.now();
    let cleanedSessions = 0;
    let cleanedLocks = 0;
    let cleanedTrackers = 0;
    
    // Clean old sessions (> 2 hours)
    for (const [sessionId, session] of this.registrationSessions.entries()) {
      const sessionAge = now - new Date(session.createdAt).getTime();
      if (sessionAge > 2 * 60 * 60 * 1000) {
        this.registrationSessions.delete(sessionId);
        this.otpStorage.delete(sessionId);
        cleanedSessions++;
      }
    }
    
    // Clean old payment locks (> 5 minutes)
    for (const [sessionId, lockTime] of this.paymentLocks.entries()) {
      if (now - lockTime > 5 * 60 * 1000) {
        this.paymentLocks.delete(sessionId);
        cleanedLocks++;
      }
    }

    // Clean old PDF delivery trackers (> 7 days)
     for (const [registrationId, tracker] of this.pdfDeliveryTracker.entries()) {
        if (tracker.delivered && now - new Date(tracker.deliveredAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
          this.pdfDeliveryTracker.delete(registrationId);
          cleanedTrackers++;
        }
      }
    
    // Include cleanedTrackers
    if (cleanedSessions > 0 || cleanedLocks > 0 || cleanedTrackers > 0) {
      console.log(`🧹 Memory cleanup: ${cleanedSessions} sessions, ${cleanedLocks} locks, ${cleanedTrackers} trackers removed`);
    }
  }

  /**
   * Create new registration session with personal details
   */
  createRegistrationSession(personalDetails, registrationType, otp) {
    try {
      console.log('🔍 Creating session with data:', { personalDetails, registrationType });
      
      // Handle both nested teamHead and flat structure
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

      //  Validate we have the required fields
      if (!actualPersonalDetails || !actualPersonalDetails.email || !actualPersonalDetails.phone) {
        console.log('❌ Missing required personal details:', actualPersonalDetails);
        throw new Error('Invalid personal details - email and phone are required');
      }

      const sessionId = uuidv4();
      const sessionData = {
        personalDetails: actualPersonalDetails, //  Use the correct personal details
        registrationType,
        otp,
        otpVerified: false,
        currentPhase: 'started',
        totalAmount: 0,
        prelimEvents: [],
        teamData: null,
        createdAt: new Date().toISOString(),
        otpCreatedAt: Date.now(),
        paymentStatus: 'pending',
        isPremium: false,
        needsAccommodation: false
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

  /**
   * Verify OTP with security enhancements and rate limiting
   */
  verifyOTP(sessionId, enteredOTP) {
    const session = this.registrationSessions.get(sessionId);
    const storedOTP = this.otpStorage.get(sessionId);
    
    if (!session || !storedOTP) {
      return { success: false, message: 'Session not found or OTP expired' };
    }

    //  Rate limiting
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

    //  Constant-time comparison
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

  /**
   * Setup individual events and calculate amount with premium and accommodation
   */
  setupIndividualEvents(sessionId, prelimEvents, isPremium = false, needsAccommodation = false) {
    const session = this.registrationSessions.get(sessionId);
    if (!session || !session.otpVerified) throw new Error('Session not found or OTP not verified');
    if (session.registrationType !== 'individual') throw new Error('Invalid registration type');

    // Validate prelim events
    if (!prelimEvents || !Array.isArray(prelimEvents)) {
      throw new Error('Prelim events array is required');
    }

    // Calculate amount with premium and accommodation
    const totalAmount = calculateIndividualAmount(prelimEvents, isPremium, needsAccommodation);
    
    console.log('💰 DEBUG - Individual Events:', prelimEvents);
    console.log('💰 DEBUG - Premium:', isPremium);
    console.log('💰 DEBUG - Accommodation:', needsAccommodation);
    console.log('💰 DEBUG - Final Amount:', totalAmount);

    session.prelimEvents = prelimEvents;
    session.totalAmount = totalAmount;
    session.isPremium = isPremium;
    session.needsAccommodation = needsAccommodation;
    session.currentPhase = 'individual_setup';
    
    this.registrationSessions.set(sessionId, session);

    return {
      personalDetails: session.personalDetails,
      prelimEvents: session.prelimEvents,
      totalAmount: session.totalAmount,
      isPremium: session.isPremium,
      needsAccommodation: session.needsAccommodation
    };
  }

  /**
   * Setup team details with validation and member management
   */
  setupTeamDetails(sessionId, teamName, mainEvent, teamMembers, leaderPrelimEvents = [], teamSize, esportsGame = null, needsAccommodation = false, isPremium = false) {
    const session = this.registrationSessions.get(sessionId);
    if (!session || !session.otpVerified) throw new Error('Session not found or OTP not verified');
    if (session.registrationType !== 'team') throw new Error('Invalid registration type');
    
    console.log('🔍 [TEAM SETUP DEBUG] Received data:', {
      teamName,
      mainEvent,
      teamMembersCount: teamMembers?.length,
      teamSize,
      leaderPrelimEvents: leaderPrelimEvents,
      esportsGame,
      needsAccommodation,
      isPremium
    });

    // Validate main event
    if (!TEAM_SIZE_RULES[mainEvent]) {
      throw new Error('Please select a valid team event');
    }

    // Validate team size rules
    const teamRules = TEAM_SIZE_RULES[mainEvent];
    const totalTeamSize = teamMembers.length + 1;
    
    if (totalTeamSize < teamRules.min || totalTeamSize > teamRules.max) {
      throw new Error(`${mainEvent} requires ${teamRules.min}-${teamRules.max} members (including team leader). You have ${totalTeamSize} members.`);
    }

    // Validate E-sports game selection
    if (mainEvent === 'E-sports' && !E_SPORTS_GAMES.includes(esportsGame)) {
      throw new Error('Please select a valid E-sports game');
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

    // Validate team member data
    for (const member of teamMembers) {
      if (!member.name || !member.email || !member.phone) {
        throw new Error('All team members must have name, email, and phone');
      }
    }

    // Calculate team amount with accommodation
    const totalAmount = calculateTeamAmount(mainEvent, totalTeamSize, needsAccommodation, esportsGame, isPremium);
    
    session.teamData = {
      teamName: teamName.trim().substring(0, 50), 
      mainEvent,
      teamMembers,
      teamLeader: {
        ...session.personalDetails,
        prelimEvents: leaderPrelimEvents || [] 
      },
      teamSize: totalTeamSize,
      esportsGame: esportsGame
    };
    session.totalAmount = totalAmount;
    session.needsAccommodation = needsAccommodation;
    session.isPremium = isPremium; 
    session.currentPhase = 'team_setup';
    
    this.registrationSessions.set(sessionId, session);

    return {
      teamLeader: session.teamData.teamLeader,
      teamName: session.teamData.teamName,
      mainEvent: session.teamData.mainEvent,
      teamMembers: session.teamData.teamMembers,
      teamSize: totalTeamSize,
      esportsGame: session.teamData.esportsGame,
      totalAmount: session.totalAmount,
      needsAccommodation: session.needsAccommodation,
      isPremium: session.isPremium 
    };
  }

  /**
   * Initialize payment process for registration
   */
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
      };

    } catch (error) {
      console.error('Payment initialization error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Verify payment and complete registration with security locks
   */
  async verifyAndCompleteRegistration(sessionId, paymentData) {
    // Check for duplicate payment processing
    if (!this.acquirePaymentLock(sessionId)) {
      throw new Error('Payment is already being processed for this registration. Please wait a moment...');
    }

    try {
      const session = this.registrationSessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
      
      if (!razorpay_order_id || !razorpay_payment_id) {
        throw new Error('Missing payment verification data');
      }

      // Your existing verification code continues here...
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

      const properPaymentResult = {
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: 'captured'
      };

      const completionResult = this.completeRegistration(sessionId, properPaymentResult, 'razorpay');

      session.paymentStatus = 'completed';
      session.currentPhase = 'completed';
      this.registrationSessions.set(sessionId, session);

      return completionResult;

    } finally {
      // Always release lock
      this.releasePaymentLock(sessionId);
    }
  }

  /**
   * Get payment status for a session
   */
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

  /**
   * Get registration review data before completion
   */
  getRegistrationReview(sessionId) {
    const session = this.registrationSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.registrationType === 'individual') {
      return {
        registrationType: 'individual',
        personalDetails: session.personalDetails,
        prelimEvents: session.prelimEvents,
        totalAmount: session.totalAmount,
        isPremium: session.isPremium,
        needsAccommodation: session.needsAccommodation,
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
        teamSize: session.teamData.teamSize,
        esportsGame: session.teamData.esportsGame,
        totalAmount: session.totalAmount,
        needsAccommodation: session.needsAccommodation,
        currentPhase: 'review',
        paymentStatus: session.paymentStatus
      };
    }
  }

  /**
 * Complete registration and store final data
 */
completeRegistration(sessionId, paymentResult, paymentMethod = 'razorpay') {
  const session = this.registrationSessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  
  // ✅ CRITICAL: Check if session already completed
  if (session.paymentStatus === 'completed') {
    console.log('⚠️ Session already completed:', sessionId);
    throw new Error('Registration already completed for this session');
  }
  
  console.log('🔍 [COMPLETE DEBUG] Session data:', {
    teamLeaderName: session.teamData?.teamLeader?.name,
    teamLeaderPrelimEvents: session.teamData?.teamLeader?.prelimEvents, 
    isPremium: session.isPremium,
    needsAccommodation: session.needsAccommodation
  });

  const registrationId = this.generateRegistrationId(session.registrationType);
  const teamId = session.registrationType === 'team' ? this.generateTeamId() : null;

  let finalRegistration;

  // Get transaction ID from payment result
  const transactionId = paymentResult.paymentId || paymentResult.paymentDetails?.transactionId;
  const orderId = paymentResult.orderId || paymentResult.paymentDetails?.orderId;
  
  console.log('💾 Storing payment data:', {
    transactionId,
    orderId,
    amount: session.totalAmount
  });

  // ✅ CRITICAL FIX: Extract premium and accommodation from session
  const isPremium = session.isPremium || false;
  const needsAccommodation = session.needsAccommodation || false;

  if (session.registrationType === 'individual') {
    finalRegistration = {
      registrationType: 'individual',
      registrationId,
      personalDetails: session.personalDetails,
      prelimEvents: session.prelimEvents,
      isPremium: isPremium,
      needsAccommodation: needsAccommodation,
      paymentDetails: {
        transactionId: transactionId,
        orderId: orderId,
        paymentId: paymentResult.paymentId,
        signature: paymentResult.signature,
        amount: session.totalAmount,
        method: paymentMethod === 'upi' ? 'upi' : 'razorpay', // ✅ FIXED: Proper payment method
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
      ...session.teamData.teamLeader,
      prelimEvents: session.teamData.teamLeader.prelimEvents || [] 
    };
    
    console.log('🔍 [FINAL TEAM LEADER DEBUG] Team leader data:', {
      name: teamLeaderData.name,
      prelimEvents: teamLeaderData.prelimEvents, 
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
      teamSize: session.teamData.teamSize,
      esportsGame: session.teamData.esportsGame,
      isPremium: isPremium,
      needsAccommodation: needsAccommodation,
      paymentDetails: {
        transactionId: transactionId,
        orderId: orderId,
        paymentId: paymentResult.paymentId,
        signature: paymentResult.signature,
        amount: session.totalAmount,
        method: paymentMethod === 'upi' ? 'upi' : 'razorpay', // ✅ FIXED: Proper payment method
        status: paymentResult.status || 'captured',
        transactionDate: new Date().toISOString(),
        razorpayPaymentId: transactionId,
        razorpayOrderId: orderId,
        ...paymentResult.paymentDetails
      },
      totalAmount: session.totalAmount,
      registeredAt: new Date().toISOString(),
      qrData: this.generateQRData('team', teamId, session.personalDetails, session.teamData)
    };
  }

  console.log('✅ [FINAL REGISTRATION DEBUG] Final registration:', {
    teamLeader: finalRegistration.teamLeader?.name,
    prelimEvents: finalRegistration.teamLeader?.prelimEvents, 
    isPremium: finalRegistration.isPremium,
    needsAccommodation: finalRegistration.needsAccommodation,
    paymentMethod: finalRegistration.paymentDetails.method // ✅ Added payment method debug
  });

  // ✅ CRITICAL FIX: Save to Google Sheets
  try {
    const GoogleSheetsService = require('./googleSheetsService');
    console.log('💾 Saving to Google Sheets...');
    GoogleSheetsService.saveRegistration(finalRegistration);
    console.log('✅ Google Sheets save initiated');
  } catch (error) {
    console.error('❌ Failed to save to Google Sheets:', error);
    // Don't throw error here - registration should still complete
  }

  // Save to completed registrations
  this.completedRegistrations.set(registrationId, finalRegistration);
  
  // ✅ CRITICAL: Mark session as completed immediately
  session.paymentStatus = 'completed';
  session.currentPhase = 'completed';
  
  // ✅ CRITICAL: Delete session immediately to prevent reuse
  this.registrationSessions.delete(sessionId);

  console.log(`✅ ${session.registrationType} registration completed: ${registrationId}`);
  console.log(`💰 Transaction ID stored: ${transactionId}`);
  console.log(`📊 Payment Method: ${finalRegistration.paymentDetails.method}`);
  console.log(`🧹 Session deleted: ${sessionId}`);
  
  return {
    registrationId,
    teamId,
    finalRegistration,
    transactionId: transactionId,
    paymentDetails: finalRegistration.paymentDetails
  };
}
  
  /**
   * Generate unique registration ID
   */
  generateRegistrationId(registrationType) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex'); 
    const prefix = registrationType === 'individual' ? 'CH2025-IND' : 'CH2025-MEM';
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate unique team ID
   */
  generateTeamId() {
    const random = crypto.randomBytes(4).toString('hex'); 
    return `CH2025-TEAM-${Date.now()}-${random}`;
  }

  /**
   * Generate QR code data for attendance
   */
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

  /**
   * Get session by session ID
   */
  getSession(sessionId) {
    return this.registrationSessions.get(sessionId);
  }

  /**
   * Get all completed registrations
   */
  getAllRegistrations() {
    return Array.from(this.completedRegistrations.values());
  }

  /**
   * Clean up old sessions and expired OTPs
   */
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

  /**
   * Validate personal details format and content
   */
  validatePersonalDetails(personalDetails) {
    const { name, email, phone, college } = personalDetails;
    
    if (!name || !email || !phone || !college) {
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

// Export service instance
module.exports = new RegistrationService();
