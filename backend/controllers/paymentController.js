const RegistrationService = require('../services/registrationService');
const PaymentService = require('../services/paymentService');
const GoogleSheetsService = require('../services/googleSheetsService'); // ✅ ADD THIS
const EmailService = require('../services/emailService'); // ✅ ADD THIS

const initializePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Get registration data
    const registrationData = RegistrationService.getRegistrationSession(sessionId);
    if (!registrationData) {
      return res.status(404).json({
        success: false,
        message: 'Registration session not found'
      });
    }

    console.log('🔍 DEBUG - Full Registration Data:', registrationData);

    let amount = registrationData.totalAmount || 0;
    let customerInfo = registrationData.personalDetails || {};
    let registrationType = registrationData.registrationType || 'individual';

    console.log('💰 DEBUG - Session Amount:', amount);
    console.log('💰 DEBUG - Registration Type:', registrationType);
    console.log('💰 DEBUG - Customer Info:', customerInfo);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid amount for payment: ${amount}. Please complete event selection first.`
      });
    }

    if (!registrationData.otpVerified) {
      return res.status(400).json({
        success: false,
        message: 'OTP not verified. Please complete OTP verification first.'
      });
    }

    // Initialize payment
    const paymentResult = await PaymentService.initializePayment(
      sessionId, 
      amount, 
      customerInfo, 
      registrationType
    );

    if (!paymentResult.success) {
      return res.status(400).json(paymentResult);
    }

    res.json(paymentResult);

  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { 
      sessionId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    if (!sessionId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Verify payment
    const verificationResult = await PaymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // Complete registration
    const registrationResult = await RegistrationService.verifyAndCompleteRegistration(
      sessionId,
      { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        ...verificationResult
      }
    );

    console.log('🔍 [PAYMENT DEBUG] Final registration data:', JSON.stringify(registrationResult.finalRegistration, null, 2));
    console.log('🔍 [PAYMENT DEBUG] Team leader prelim events:', registrationResult.finalRegistration.teamLeader?.prelimEvents);

    console.log('✅ Registration completed, now saving to Google Sheets and sending email...');

    // ✅ FIXED: Use async/await instead of .then().catch() to ensure proper execution
    let sheetsResult = { success: false, message: 'Not attempted' };
    let eventsResult = { success: false, message: 'Not attempted' };
    let emailResult = { success: false, message: 'Not attempted' };

    // 1. Save to main registration sheet
    try {
      console.log('💾 Saving to main registration sheet...');
      sheetsResult = await GoogleSheetsService.saveRegistration(registrationResult.finalRegistration);
      console.log('📊 Main sheet save result:', sheetsResult);
    } catch (sheetsError) {
      console.error('❌ Main sheet save failed:', sheetsError);
      sheetsResult = { success: false, message: sheetsError.message };
    }

    // 2. ✅ FIXED: Save to events sheet with AWAIT
    try {
      console.log('🎯 Saving to events sheet...');
      console.log('🔍 Events sheet data check:', {
        teamLeader: registrationResult.finalRegistration.teamLeader?.name,
        leaderPrelimEvents: registrationResult.finalRegistration.teamLeader?.prelimEvents,
        teamMembers: registrationResult.finalRegistration.teamMembers?.length
      });
      
      eventsResult = await GoogleSheetsService.saveToEventsSheet(registrationResult.finalRegistration);
      console.log('✅ Events sheet save result:', eventsResult);
    } catch (eventsError) {
      console.error('❌ Events sheet save failed:', eventsError);
      console.error('❌ Events sheet error details:', eventsError.message);
      eventsResult = { success: false, message: eventsError.message };
    }

    // 3. Send confirmation email
    try {
      console.log('📧 Sending confirmation email...');
      if (registrationResult.finalRegistration.registrationType === 'individual') {
        emailResult = await EmailService.sendIndividualConfirmation(registrationResult.finalRegistration);
      } else {
        emailResult = await EmailService.sendTeamConfirmation(registrationResult.finalRegistration);
      }
      console.log('📧 Email send result:', emailResult);
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError);
      emailResult = { success: false, message: emailError.message };
    }

    // ✅ Return all results for debugging
    res.json({
      success: true,
      registrationId: registrationResult.registrationId,
      teamId: registrationResult.teamId,
      finalRegistration: registrationResult.finalRegistration,
      paymentResult: verificationResult,
      services: {
        mainSheet: sheetsResult,
        eventsSheet: eventsResult, // ✅ This will show if events sheet saved successfully
        email: emailResult
      },
      message: 'Payment verified and registration completed successfully'
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment
};