/**
 * 💳 UPI PAYMENT SERVICE
 * 
 * Replaces Razorpay with automatic UPI payments
 * Same structure, just UPI instead of Razorpay
 */

const crypto = require('crypto');

class PaymentService {
  constructor() {
    console.log('💰 UPI Payment Service Initialized - Automatic Processing');
  }

  /**
   * Process UPI payment - automatic verification
   */
  async processUPIPayment(amount, sessionId, customerInfo = {}, type = 'registration') {
    try {
      console.log('💰 Processing UPI payment:', amount);
      
      // Generate unique UPI transaction reference
      const upiTransactionId = `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
      
      return {
        success: true,
        upiTransactionId,
        amount: amount,
        currency: "INR",
        paymentMethod: "upi",
        status: "created",
        instructions: "Pay via UPI and get automatic confirmation"
      };

    } catch (error) {
      console.error('Error in processUPIPayment:', error);
      return { 
        success: false, 
        message: 'UPI payment processing error: ' + error.message 
      };
    }
  }

  /**
 * Verify UPI payment automatically (simulated for now)
 */
async verifyUPIPayment(upiTransactionId, amount) {
  try {
    console.log('🔍 Verifying UPI payment:', upiTransactionId);
    
    // Simulate automatic UPI verification
    // In production, integrate with UPI service provider
    const isVerified = false; // Auto-verify for now
    
    if (isVerified) {
      return {
        success: true,
        paymentId: upiTransactionId,
        orderId: `ORDER_${upiTransactionId}`,
        status: 'completed',
        // ✅ ADDED: Include all payment details needed by registration service
        paymentDetails: {
          transactionId: upiTransactionId,
          orderId: `ORDER_${upiTransactionId}`,
          amount: amount,
          currency: 'INR',
          method: 'upi',
          captured: true,
          createdAt: new Date().toISOString()
        },
        // ✅ ADDED: Razorpay-compatible fields
        razorpay_payment_id: upiTransactionId,
        razorpay_order_id: `ORDER_${upiTransactionId}`,
        razorpay_signature: `SIG_${upiTransactionId}`
      };
    } else {
      return {
        success: false,
        message: 'UPI payment verification failed'
      };
    }

  } catch (error) {
    console.error('UPI payment verification error:', error);
    return {
      success: false,
      message: 'UPI verification failed: ' + error.message
    };
  }
}

  /**
   * Initialize payment - UPI version
   */
  async initializePayment(sessionId, amount, customerInfo = {}, registrationType = 'individual') {
    try {
      console.log('💰 Initializing UPI payment for session:', sessionId);
      
      return await this.processUPIPayment(
        amount,
        sessionId,
        customerInfo,
        registrationType
      );

    } catch (error) {
      console.error('Error in initializePayment:', error);
      return { 
        success: false, 
        message: 'Payment initialization error: ' + error.message 
      };
    }
  }
}

// Export service instance
module.exports = new PaymentService();
