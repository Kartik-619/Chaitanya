/**
 * 💳 UPI PAYMENT CONTROLLER
 * 
 * Handles UPI payment processing with security enhancements
 * Prevents duplicate entries and amount manipulation
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

    // ✅ SECURITY: Check if payment already completed
    if (registrationData.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this registration'
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
 * ✅ SECURITY ENHANCED: Prevents duplicate entries and amount manipulation
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
        message: 'Registration session not found or expired'
      });
    }

    console.log('🔍 [PAYMENT DEBUG] Session found:', {
      registrationType: registrationData.registrationType,
      totalAmount: registrationData.totalAmount,
      expectedAmount: amount,
      paymentStatus: registrationData.paymentStatus
    });

    // ✅ CRITICAL SECURITY: Check if this session was already processed
    if (registrationData.paymentStatus === 'completed') {
      console.log('⚠️ Payment already completed for session:', sessionId);
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this registration. Please do not resubmit.'
      });
    }

    // ✅ CRITICAL SECURITY: Verify amount matches expected amount
    const expectedAmount = registrationData.totalAmount;
    if (parseFloat(amount) !== parseFloat(expectedAmount)) {
      console.error('❌ SECURITY: Amount mismatch detected:', {
        received: amount,
        expected: expectedAmount,
        sessionId,
        upiTransactionId
      });
      return res.status(400).json({
        success: false,
        message: `Payment amount mismatch. Expected: ₹${expectedAmount}, Received: ₹${amount}. Please pay the exact amount.`
      });
    }

    console.log('✅ Amount verification passed:', { received: amount, expected: expectedAmount });

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
      teamId: registrationResult.teamId,
      paymentMethod: registrationResult.finalRegistration.paymentDetails.method
    });

    // ✅ SUCCESS: Return response without duplicate processing
    res.json({
      success: true,
      registrationId: registrationResult.registrationId,
      teamId: registrationResult.teamId,
      finalRegistration: registrationResult.finalRegistration,
      paymentResult: verificationResult,
      message: 'UPI payment verified and registration completed successfully!',
      security: {
        amountVerified: true,
        duplicatePrevented: true,
        sessionCleaned: true
      }
    });

  } catch (error) {
    console.error('❌ Verify UPI payment error:', error);
    
    // ✅ IMPROVED ERROR HANDLING: Specific error messages
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message.includes('already completed') || error.message.includes('already processed')) {
      statusCode = 400;
      errorMessage = 'This registration has already been completed. Please do not resubmit.';
    } else if (error.message.includes('amount')) {
      statusCode = 400;
      errorMessage = 'Payment amount verification failed. Please contact support.';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get payment status for a session
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const status = RegistrationService.getPaymentStatus(sessionId);
    
    res.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export payment controller functions
module.exports = {
  initializePayment,
  verifyPayment,
  getPaymentStatus
};
