import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Payment = ({ data, updateData, nextStep, prevStep }) => {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Pay with UPI, Card, Net Banking',
      icon: '💳'
    }
  ];

  // ✅ FIXED: Better total amount calculation with debug logs
  const getTotalAmount = () => {
    console.log('💰 Payment Debug - Full data:', data);
    
    if (data.registrationType === 'individual') {
      const amount = data.individualData?.totalAmount || 0;
      console.log('💰 Individual Amount:', amount, 'Data:', data.individualData);
      return amount;
    } else {
      const amount = data.teamData?.totalAmount || 0;
      console.log('💰 Team Amount:', amount, 'Data:', data.teamData);
      return amount;
    }
  };

  const totalAmount = getTotalAmount();

  // ✅ FIXED: Validate amount before payment
  const validatePayment = () => {
    if (totalAmount <= 0) {
      console.error('❌ Invalid amount detected:', totalAmount);
      toast.error('Invalid payment amount. Please go back and reselect your events.');
      return false;
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay SDK loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Razorpay SDK failed to load');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!data.sessionId) {
      toast.error('Session expired. Please start registration again.');
      return;
    }

    // ✅ FIXED: Validate amount before proceeding
    if (!validatePayment()) {
      return;
    }

    setProcessing(true);

    try {
      console.log('🔄 Step 1: Initializing payment for amount:', totalAmount);
      console.log('🔄 Session ID:', data.sessionId);
      console.log('🔄 Registration Type:', data.registrationType);
      
      // ✅ FIXED: Remove duplicate data - backend gets everything from session
      const orderResponse = await fetch('http://localhost:5000/api/payment/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId
          // ❌ REMOVED: amount, registrationType, customerInfo - backend gets from session
        }),
      });

      // ✅ ADDED: Check for HTTP errors
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('❌ Payment initialization failed:', orderResponse.status, errorText);
        throw new Error(`Payment failed: ${orderResponse.status}`);
      }

      const result = await orderResponse.json();
      console.log('📋 Payment initialization response:', result);

      if (!result.success) {
        toast.error(result.message || 'Payment initialization failed');
        setProcessing(false);
        return;
      }

      // For Razorpay payment with order details
      if (result.orderDetails && result.keyId) {
        await processRazorpayPayment(result);
      } else {
        toast.error('Invalid payment response from server');
        setProcessing(false);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Network error. Please try again.');
      setProcessing(false);
    }
  };

  const processRazorpayPayment = async (paymentData) => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load');
        setProcessing(false);
        return;
      }

      // Get user details based on registration type
      const userDetails = data.registrationType === 'individual' 
        ? data.individualData?.personalDetails 
        : data.teamData?.teamLeader;

      const options = {
        key: paymentData.keyId,
        amount: paymentData.orderDetails.amount,
        currency: "INR",
        name: "CHAITANYA 2025",
        description: `${data.registrationType === 'individual' ? 'Individual' : 'Team'} Registration`,
        order_id: paymentData.orderDetails.orderId,
        handler: async (response) => {
          console.log('🔄 Payment handler called:', response);
          await verifyPayment(response);
        },
        prefill: {
          name: userDetails?.name || '',
          email: userDetails?.email || '',
          contact: userDetails?.phone || ''
        },
        theme: {
          color: "#EF4444"
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment modal dismissed');
            setProcessing(false);
            toast.error('Payment cancelled');
          }
        },
        notes: {
          registrationType: data.registrationType,
          sessionId: data.sessionId
        }
      };

      console.log('🎯 Opening Razorpay checkout...');
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response) => {
        console.error('❌ Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      razorpay.open();

    } catch (error) {
      console.error('Razorpay initialization error:', error);
      toast.error('Failed to initialize payment');
      setProcessing(false);
    }
  };

  const verifyPayment = async (razorpayResponse) => {
    try {
      setProcessing(true);
      console.log('🔍 Verifying payment...', razorpayResponse);

      const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        }),
      });

      // ✅ ADDED: Check for HTTP errors
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('❌ Payment verification failed:', verifyResponse.status, errorText);
        throw new Error(`Payment verification failed: ${verifyResponse.status}`);
      }

      const verifyResult = await verifyResponse.json();
      console.log('📋 Verification result:', verifyResult);

      if (verifyResult.success) {
        // ✅ FIXED: Use data from verification result directly
        updateData({
          paymentResult: verifyResult,
          registrationId: verifyResult.registrationId,
          teamId: verifyResult.teamId,
          finalRegistration: verifyResult.finalRegistration,
          transactionId: verifyResult.finalRegistration?.paymentDetails?.transactionId,
          paymentDetails: verifyResult.finalRegistration?.paymentDetails,
          registrationComplete: true
        });
        
        toast.success('Payment successful! Registration completed.');
        
        // Move to success page
        setTimeout(() => {
          nextStep();
        }, 1000);
        
      } else {
        toast.error(verifyResult.message || 'Payment verification failed');
        setProcessing(false);
      }

    } catch (error) {
      console.error('Verification error:', error);
      
      // ✅ FIXED: Better error handling
      if (error.message.includes('Unexpected token')) {
        toast.error('Server error. Please contact support with your transaction ID.');
      } else {
        toast.error(error.message || 'Payment verification failed. Please contact support.');
      }
      setProcessing(false);
    }
  };

  // Get registration details for display
  const getRegistrationDetails = () => {
    if (data.registrationType === 'individual') {
      return {
        type: 'Individual',
        events: data.individualData?.prelimEvents?.length || 0,
        details: data.individualData?.personalDetails
      };
    } else {
      return {
        type: 'Team',
        events: 1, // Main event only
        teamName: data.teamData?.teamName,
        teamSize: data.teamData?.teamMembers?.length + 1 || 1,
        details: data.teamData?.teamLeader
      };
    }
  };

  const registrationDetails = getRegistrationDetails();

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          Complete Payment
        </h2>
        <p className="text-gray-300">Final step to confirm your registration</p>
      </div>

      <div className="space-y-6">
        {/* Registration Summary */}
        <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Registration Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Registration Type</span>
              <span className="text-white">{registrationDetails.type}</span>
            </div>
            
            {data.registrationType === 'individual' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Preliminary Events</span>
                  <span className="text-white">{registrationDetails.events}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Participant</span>
                  <span className="text-white">{registrationDetails.details?.name}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Team Name</span>
                  <span className="text-white">{registrationDetails.teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Team Size</span>
                  <span className="text-white">{registrationDetails.teamSize} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Team Leader</span>
                  <span className="text-white">{registrationDetails.details?.name}</span>
                </div>
              </>
            )}
            
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Amount</span>
                <span className={`text-xl ${totalAmount > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  ₹{totalAmount}
                  {totalAmount <= 0 && ' (Free)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                  paymentMethod === method.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-transparent hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{method.name}</div>
                      <div className="text-sm text-gray-300">{method.description}</div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-500'
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="glass-card p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="text-sm text-yellow-200">
              <strong>Secure Payment:</strong> Your payment is processed securely via Razorpay. 
              We do not store your card details. All transactions are encrypted and secure.
            </div>
          </div>
        </div>

        {/* Test Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="glass-card p-4 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200">
                <strong>Test Mode:</strong> Payments are processed in test mode. No real money will be deducted.
                Use test card: 4111 1111 1111 1111
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={prevStep}
            disabled={processing}
            className="flex-1 glass-input py-3 px-6 font-medium hover:bg-white/10 transition-colors disabled:opacity-50 rounded-lg"
          >
            Back to Review
          </button>
          <button
            onClick={handlePayment}
            disabled={processing || totalAmount < 0}
            className="flex-1 glass-button py-3 px-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : totalAmount > 0 ? (
              `Pay ₹${totalAmount}`
            ) : (
              'Complete Registration (Free)'
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-400">
          Having trouble with payment? Contact us at{' '}
          <a href="mailto:chaitanyahptu@gmail.com" className="text-red-400 hover:text-red-300">
            chaitanyahptu@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Payment;