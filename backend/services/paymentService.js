const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PAYMENT_CONFIG } = require('../config/paymentConfig');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: PAYMENT_CONFIG.RAZORPAY.KEY_ID,
      key_secret: PAYMENT_CONFIG.RAZORPAY.KEY_SECRET
    });
    console.log('💰 Razorpay Payment Service Initialized');
  }

  async processIndividualPayment(amount, sessionId, customerInfo = {}) {
    console.log('💳 Processing individual payment:', amount);
    return await this.processRegistrationPayment(amount, sessionId, customerInfo, 'individual');
  }

  async processTeamPayment(amount, sessionId, customerInfo = {}) {
    console.log('💳 Processing team payment:', amount);
    return await this.processRegistrationPayment(amount, sessionId, customerInfo, 'team');
  }

  async processRegistrationPayment(amount, sessionId, customerInfo = {}, type = 'registration') {
    try {
      console.log('💰 Processing payment for:', type, 'Amount:', amount);
      
      const receipt = `chaitanya_${type}_${sessionId}_${Date.now()}`;
      const amountInPaise = Math.round(amount * 100);
      
      const razorpayOrder = await this.createOrder(
        amountInPaise,
        receipt,
        {
          customerName: customerInfo.name || '',
          customerEmail: customerInfo.email || '',
          customerPhone: customerInfo.phone || '',
          sessionId: sessionId,
          registrationType: type,
          college: customerInfo.college || ''
        }
      );

      if (!razorpayOrder.success) {
        return razorpayOrder;
      }

      return {
        success: true,
        orderDetails: razorpayOrder,
        keyId: PAYMENT_CONFIG.RAZORPAY.KEY_ID
      };

    } catch (error) {
      console.error('Error in processRegistrationPayment:', error);
      return { 
        success: false, 
        message: 'Payment processing error: ' + error.message 
      };
    }
  }

  async createOrder(amount, receipt, notes = {}) {
    try {
      console.log('💳 Creating Razorpay order for: ₹', amount / 100);
      
      // Fix receipt length - max 40 characters for Razorpay
      const shortReceipt = receipt.length > 40 ? receipt.substring(0, 40) : receipt;
      
      const options = {
        amount: amount,
        currency: "INR",
        receipt: shortReceipt,
        notes: notes,
        payment_capture: 1
      };

      const order = await this.razorpay.orders.create(options);
      
      console.log('✅ Razorpay order created:', order.id);
      
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
      
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      return {
        success: false,
        message: error.error?.description || 'Payment order creation failed'
      };
    }
  }

  async verifyPayment(orderId, paymentId, signature) {
    try {
      console.log('🔍 Verifying Razorpay payment...');
      
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', PAYMENT_CONFIG.RAZORPAY.KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      
      const isAuthentic = expectedSignature === signature;
      
      if (isAuthentic) {
        console.log('✅ Razorpay payment verification successful');
        
        // ✅ ADDED: Fetch payment details to get complete transaction info
        try {
          const payment = await this.razorpay.payments.fetch(paymentId);
          console.log('💰 Payment details:', {
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            bank: payment.bank,
            card_id: payment.card_id,
            captured: payment.captured,
            createdAt: payment.created_at
          });
          
          return {
            success: true,
            paymentId: paymentId,
            orderId: orderId,
            signature: signature,
            status: 'captured',
            // ✅ ADDED: Complete payment details for storage
            paymentDetails: {
              transactionId: paymentId, // This is the main transaction ID
              orderId: orderId,
              amount: payment.amount / 100, // Convert back to rupees
              currency: payment.currency,
              method: payment.method,
              bank: payment.bank,
              cardId: payment.card_id,
              captured: payment.captured,
              createdAt: new Date(payment.created_at * 1000).toISOString()
            }
          };
        } catch (razorpayError) {
          console.error('Failed to fetch payment details:', razorpayError);
          // Fallback if Razorpay API call fails
          return {
            success: true,
            paymentId: paymentId,
            orderId: orderId,
            signature: signature,
            status: 'captured',
            paymentDetails: {
              transactionId: paymentId,
              orderId: orderId,
              amount: 0, // Will be set by registration service
              currency: 'INR',
              method: 'unknown',
              captured: true,
              createdAt: new Date().toISOString()
            }
          };
        }
      } else {
        console.error('❌ Razorpay payment verification failed: Invalid signature');
        return {
          success: false,
          message: 'Payment verification failed: Invalid signature'
        };
      }
      
    } catch (error) {
      console.error('Razorpay payment verification error:', error);
      return {
        success: false,
        message: 'Payment verification failed: ' + error.message
      };
    }
  }

  async initializePayment(sessionId, amount, customerInfo = {}, registrationType = 'individual') {
    try {
      console.log('💰 Initializing payment for session:', sessionId);
      
      const receipt = `chaitanya_${registrationType}_${sessionId}_${Date.now()}`;
      const amountInPaise = Math.round(amount * 100);
      
      const razorpayOrder = await this.createOrder(
        amountInPaise,
        receipt,
        {
          customerName: customerInfo.name || '',
          customerEmail: customerInfo.email || '',
          customerPhone: customerInfo.phone || '',
          sessionId: sessionId,
          registrationType: registrationType,
          college: customerInfo.college || ''
        }
      );

      if (!razorpayOrder.success) {
        return razorpayOrder;
      }

      return {
        success: true,
        orderDetails: razorpayOrder,
        keyId: PAYMENT_CONFIG.RAZORPAY.KEY_ID
      };

    } catch (error) {
      console.error('Error in initializePayment:', error);
      return { 
        success: false, 
        message: 'Payment initialization error: ' + error.message 
      };
    }
  }
}

module.exports = new PaymentService();