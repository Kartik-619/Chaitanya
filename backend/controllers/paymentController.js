/**
 * 💳 UPI PAYMENT CONTROLLER
 * 
 * Handles UPI payment processing instead of Razorpay
 * Same API structure for seamless replacement
 */

const RegistrationService = require('../services/registrationService');
const PaymentService = require('../services/paymentService');

/**
 * Initialize UPI payment process
 */
const initializePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Get registration data from session
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

    // ✅ ADDED: Debug logging for premium verification
    console.log('💰 DEBUG - Payment Amount Verification:', {
      sessionId,
      amountReceived: amount,
      registrationType,
      isPremium: registrationData.isPremium,
      expectedAmount: amount
    });

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

    // Initialize UPI payment
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
    console.error('Initialize UPI payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Verify UPI payment completion and complete registration process
 */
const verifyPayment = async (req, res) => {
  try {
    const { 
      sessionId, 
      upiTransactionId,
      amount
    } = req.body;

    if (!sessionId || !upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and UPI Transaction ID are required'
      });
    }

    // Verify UPI payment automatically
    const verificationResult = await PaymentService.verifyUPIPayment(
      upiTransactionId,
      amount
    );

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // Complete registration process
    const registrationResult = await RegistrationService.verifyAndCompleteRegistration(
      sessionId,
      { 
        upiTransactionId,
        ...verificationResult
      },
      'upi' // payment method
    );

    console.log('🔍 [PAYMENT DEBUG] Final registration data:', JSON.stringify(registrationResult.finalRegistration, null, 2));

    console.log('✅ Registration completed, now saving to Google Sheets and sending email...');

    let sheetsResult = { success: false, message: 'Not attempted' };
    let eventsResult = { success: false, message: 'Not attempted' };
    let emailResult = { success: false, message: 'Not attempted' };

    // 1. Save to main registration sheet
    try {
      console.log('💾 Saving to main registration sheet...');
      const GoogleSheetsService = require('../services/googleSheetsService');
      sheetsResult = await GoogleSheetsService.saveRegistration(registrationResult.finalRegistration);
      console.log('📊 Main sheet save result:', sheetsResult);
    } catch (sheetsError) {
      console.error('❌ Main sheet save failed:', sheetsError);
      sheetsResult = { success: false, message: sheetsError.message };
    }

    // 2. Save to events sheet
    try {
      console.log('🎯 Saving to events sheet...');
      const GoogleSheetsService = require('../services/googleSheetsService');
      eventsResult = await GoogleSheetsService.saveToEventsSheet(registrationResult.finalRegistration);
      console.log('✅ Events sheet save result:', eventsResult);
    } catch (eventsError) {
      console.error('❌ Events sheet save failed:', eventsError);
      eventsResult = { success: false, message: eventsError.message };
    }

    // 3. Send confirmation email
    try {
      console.log('📧 Sending confirmation email...');
      const EmailService = require('../services/emailService');
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

    // Return all results for debugging
    res.json({
      success: true,
      registrationId: registrationResult.registrationId,
      teamId: registrationResult.teamId,
      finalRegistration: registrationResult.finalRegistration,
      paymentResult: verificationResult,
      services: {
        mainSheet: sheetsResult,
        eventsSheet: eventsResult, 
        email: emailResult
      },
      message: 'UPI payment verified and registration completed automatically'
    });

  } catch (error) {
    console.error('Verify UPI payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export payment controller functions
module.exports = {
  initializePayment,
  verifyPayment
};
