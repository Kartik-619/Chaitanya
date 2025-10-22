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

    console.log('🔍 [PAYMENT DEBUG] Verification request:', {
      sessionId,
      upiTransactionId, 
      amount
    });

    // ✅ FIX: Add validation for ALL required fields
    if (!sessionId || !upiTransactionId || !amount) {
      console.error('❌ Missing payment verification data:', {
        sessionId: !!sessionId,
        upiTransactionId: !!upiTransactionId,
        amount: !!amount
      });
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data. Required: sessionId, upiTransactionId, amount'
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

    console.log('🔍 [PAYMENT DEBUG] Session found:', {
      registrationType: registrationData.registrationType,
      totalAmount: registrationData.totalAmount,
      expectedAmount: amount
    });

    // ✅ ENHANCED: Stronger duplicate payment check
    if (registrationData.paymentStatus === 'completed') {
      console.log('⚠️ Payment already completed for session:', sessionId);
      
      // ✅ ADD: Return existing registration data to prevent frontend errors
      const existingRegistrations = Array.from(RegistrationService.completedRegistrations.values());
      const existingRegistration = existingRegistrations.find(reg => 
        reg.personalDetails?.email === registrationData.personalDetails?.email ||
        reg.teamLeader?.email === registrationData.personalDetails?.email
      );
      
      return res.json({
        success: true,
        message: 'Payment already processed successfully',
        alreadyCompleted: true,
        registrationId: existingRegistration?.registrationId,
        teamId: existingRegistration?.teamId,
        finalRegistration: existingRegistration
      });
    }

    // Verify UPI payment automatically
    const verificationResult = await PaymentService.verifyUPIPayment(
      upiTransactionId,
      amount
    );

    console.log('🔍 [PAYMENT DEBUG] Verification result:', verificationResult);

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // ✅ CRITICAL FIX: Complete registration with proper payment data
    const registrationResult = await RegistrationService.verifyAndCompleteRegistration(
      sessionId,
      { 
        // UPI data
        upiTransactionId: upiTransactionId,
        paymentId: upiTransactionId,
        orderId: `ORDER_${upiTransactionId}`,
        signature: `SIG_${upiTransactionId}`,
        
        // Razorpay-compatible fields (for existing code)
        razorpay_payment_id: upiTransactionId,
        razorpay_order_id: `ORDER_${upiTransactionId}`,
        razorpay_signature: `SIG_${upiTransactionId}`,
        
        // Payment details
        status: 'completed',
        paymentDetails: {
          transactionId: upiTransactionId,
          orderId: `ORDER_${upiTransactionId}`,
          amount: amount,
          currency: 'INR',
          method: 'upi',
          captured: true,
          createdAt: new Date().toISOString()
        }
      },
      'upi'
    );

    console.log('🔍 [PAYMENT DEBUG] Registration completed:', {
      registrationId: registrationResult.registrationId,
      teamId: registrationResult.teamId
    });

    // ✅ CRITICAL: Trigger email and PDF delivery AFTER successful registration
    try {
      const EmailService = require('../services/emailService');
      console.log('📧 Starting email delivery for:', registrationResult.registrationId);
      
      if (registrationResult.finalRegistration.registrationType === 'individual') {
        await EmailService.sendIndividualConfirmation(registrationResult.finalRegistration);
      } else {
        await EmailService.sendTeamConfirmation(registrationResult.finalRegistration);
      }
      
      console.log('✅ Email delivery initiated successfully');
    } catch (emailError) {
      console.error('❌ Email delivery failed:', emailError);
      // Don't fail the payment - email can be sent later via admin
    }

    // Return success response
    res.json({
      success: true,
      registrationId: registrationResult.registrationId,
      teamId: registrationResult.teamId,
      finalRegistration: registrationResult.finalRegistration,
      paymentResult: verificationResult,
      message: 'UPI payment verified and registration completed successfully!'
    });

  } catch (error) {
    console.error('❌ Verify UPI payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      debug: 'Check server logs for detailed error information'
    });
  }
};

// Export payment controller functions
module.exports = {
  initializePayment,
  verifyPayment
};
