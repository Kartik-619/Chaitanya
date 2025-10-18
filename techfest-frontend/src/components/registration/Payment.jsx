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

  // Get total amount with detailed debugging
  const getTotalAmount = () => {
    console.log('💰 Payment Debug - Full data:', data);
    
    if (data.registrationType === 'individual') {
      const amount = data.individualData?.totalAmount || 0;
      const isPremium = data.individualData?.isPremium || false;
      const events = data.individualData?.prelimEvents || [];
      console.log('💰 Individual Breakdown:', {
        amount,
        isPremium,
        eventsCount: events.length,
        events,
        accommodation: 600,
        premium: isPremium ? 200 : 0,
        calculatedTotal: amount
      });
      return amount;
    } else {
      const amount = data.teamData?.totalAmount || 0;
      const isPremium = data.teamData?.isPremium || false;
      const teamSize = data.teamData?.teamSize || 1;
      const mainEvent = data.teamData?.mainEvent;
      console.log('💰 Team Breakdown:', {
        amount,
        isPremium,
        teamSize,
        mainEvent,
        accommodation: 600 * teamSize,
        premium: isPremium ? 200 : 0,
        calculatedTotal: amount
      });
      return amount;
    }
  };

  const totalAmount = getTotalAmount();

  const validatePayment = () => {
    if (!data.sessionId) {
      toast.error('Session expired. Please start registration again.');
      return false;
    }

    if (totalAmount <= 0) {
      toast.error('Invalid payment amount. Please go back and reselect your events.');
      return false;
    }

    // ✅ ADDED: Validate that amount matches expected calculation
    const expectedAmount = calculateExpectedAmount();
    if (Math.abs(totalAmount - expectedAmount) > 1) { // Allow 1 rupee difference for rounding
      console.warn('⚠️ Amount mismatch detected:', {
        frontendTotal: totalAmount,
        expectedTotal: expectedAmount,
        difference: totalAmount - expectedAmount
      });
    }

    return true;
  };

  // ✅ ADDED: Calculate expected amount to verify
  const calculateExpectedAmount = () => {
    if (data.registrationType === 'individual') {
      const individualData = data.individualData || {};
      const eventCost = individualData.prelimEvents?.reduce((total, event) => {
        const prices = {
          "Integration Bee": 299,
          "Human vs AI": 299,
          "Retro Theming": 199,
          "Prompt Engineering": 199,
          "Reverse Engineering": 199,
          "Jack of Hearts": 399,
          "Singing": 99,
          "Dancing": 99
        };
        return total + (prices[event] || 0);
      }, 0) || 0;
      
      const accommodation = 600;
      const premium = individualData.isPremium ? 200 : 0;
      
      return eventCost + accommodation + premium;
    } else {
      const teamData = data.teamData || {};
      const teamSize = teamData.teamSize || 1;
      
      // Calculate base event cost
      let eventCost = 0;
      switch (teamData.mainEvent) {
        case 'Hackathon':
          eventCost = 999 + Math.max(0, (teamSize - 3) * 249);
          break;
        case 'Accurate Prediction':
          eventCost = 999 + Math.max(0, (teamSize - 2) * 249);
          break;
        case 'Polymath':
          eventCost = 499 + Math.max(0, (teamSize - 2) * 249);
          break;
        case 'E-sports':
          eventCost = 999;
          break;
        case 'Singing':
        case 'Dance':
          eventCost = 99 * teamSize;
          break;
        case 'Reverse Engineering':
        case 'Retro Theming':
        case 'Debate':
          eventCost = 199 * teamSize;
          break;
        case 'Two Minute Manager':
          eventCost = 149 * teamSize;
          break;
        default:
          eventCost = 0;
      }
      
      const accommodation = 600 * teamSize;
      const premium = teamData.isPremium ? 200 : 0;
      
      return eventCost + accommodation + premium;
    }
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
    if (!validatePayment()) {
      return;
    }

    setProcessing(true);

    try {
      console.log('🔍 Starting payment process...');
      console.log('Session ID:', data.sessionId);
      console.log('Total Amount to be paid:', totalAmount);
      console.log('Registration Type:', data.registrationType);

      // ✅ ADDED: Debug the amount being sent
      const expectedAmount = calculateExpectedAmount();
      console.log('🔍 Amount Verification:', {
        frontendTotal: totalAmount,
        expectedCalculation: expectedAmount,
        difference: totalAmount - expectedAmount,
        includesPremium: data.registrationType === 'individual' 
          ? data.individualData?.isPremium 
          : data.teamData?.isPremium
      });

      const orderResponse = await fetch('https://chaitanya-4r5f.onrender.com/api/payment/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          amount: totalAmount, // Make sure this is the correct amount
          currency: "INR",
          registrationType: data.registrationType,
          // ✅ ADDED: Send premium flag to backend for verification
          isPremium: data.registrationType === 'individual' 
            ? data.individualData?.isPremium 
            : data.teamData?.isPremium
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('❌ Payment initialization failed:', orderResponse.status, errorText);
        
        let errorMessage = 'Payment initialization failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      const result = await orderResponse.json();
      console.log('📋 Payment initialization response:', result);

      if (!result.success) {
        toast.error(result.message || 'Payment initialization failed');
        setProcessing(false);
        return;
      }

      // ✅ ADDED: Verify the amount in Razorpay order
      console.log('🔍 Razorpay Order Amount Verification:', {
        ourAmount: totalAmount,
        razorpayAmount: result.order?.amount ? result.order.amount / 100 : 'unknown',
        razorpayAmountInPaise: result.order?.amount,
        matches: result.order?.amount === totalAmount * 100
      });

      // Check for different possible response structures
      let razorpayKey, orderId, orderAmount;

      if (result.key && result.order && result.order.id) {
        razorpayKey = result.key;
        orderId = result.order.id;
        orderAmount = result.order.amount;
        
        // ✅ ADDED: Verify amount matches
        if (orderAmount !== totalAmount * 100) {
          console.error('❌ Amount mismatch with Razorpay:', {
            ourAmount: totalAmount * 100,
            razorpayAmount: orderAmount,
            difference: (totalAmount * 100) - orderAmount
          });
          toast.error('Amount mismatch detected. Please try again.');
          setProcessing(false);
          return;
        }
      } else if (result.keyId && result.orderDetails && result.orderDetails.orderId) {
        razorpayKey = result.keyId;
        orderId = result.orderDetails.orderId;
        orderAmount = result.orderDetails.amount;
      } else if (result.razorpayKey && result.orderId) {
        razorpayKey = result.razorpayKey;
        orderId = result.orderId;
        orderAmount = result.amount;
      } else {
        console.error('❌ Unknown response structure:', result);
        toast.error('Invalid payment response from server');
        setProcessing(false);
        return;
      }

      // Process Razorpay payment with extracted data
      await processRazorpayPayment({
        razorpayKey,
        orderId,
        orderAmount
      });

    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.message || 'Network error. Please try again.');
      setProcessing(false);
    }
  };

  const processRazorpayPayment = async (paymentData) => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load. Please refresh and try again.');
        setProcessing(false);
        return;
      }

      // Get user details
      const userDetails = data.registrationType === 'individual' 
        ? data.personalDetails 
        : data.teamData?.teamLeader;

      console.log('🎯 Payment data for Razorpay:', paymentData);
      console.log('🎯 Expected amount in rupees:', totalAmount);

      const options = {
        key: paymentData.razorpayKey,
        amount: paymentData.orderAmount,
        currency: "INR",
        name: "CHAITANYA 2025",
        description: `Registration for ${data.registrationType} - ${totalAmount} INR`,
        order_id: paymentData.orderId,
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
            console.log('Payment modal dismissed');
            setProcessing(false);
            toast.error('Payment cancelled');
          }
        },
        notes: {
          totalAmount: totalAmount.toString(),
          includesPremium: (data.registrationType === 'individual' 
            ? data.individualData?.isPremium 
            : data.teamData?.isPremium).toString()
        }
      };

      console.log('🎯 Razorpay options:', options);
      
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response) => {
        console.error('❌ Payment failed:', response.error);
        let errorMsg = 'Payment failed';
        if (response.error && response.error.description) {
          errorMsg = `Payment failed: ${response.error.description}`;
        }
        toast.error(errorMsg);
        setProcessing(false);
      });

      razorpay.open();

    } catch (error) {
      console.error('❌ Razorpay initialization error:', error);
      toast.error('Failed to initialize payment gateway');
      setProcessing(false);
    }
  };

  const verifyPayment = async (razorpayResponse) => {
    try {
      setProcessing(true);
      console.log('🔍 Verifying payment...', razorpayResponse);

      const verifyResponse = await fetch('https://chaitanya-4r5f.onrender.com/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          sessionId: data.sessionId,
          expectedAmount: totalAmount // ✅ Send expected amount for verification
        }),
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('❌ Payment verification failed:', verifyResponse.status, errorText);
        throw new Error('Payment verification failed');
      }

      const verifyResult = await verifyResponse.json();
      console.log('📋 Verification result:', verifyResult);

      if (verifyResult.success) {
        updateData({
          paymentResult: verifyResult,
          registrationId: verifyResult.registrationId,
          teamId: verifyResult.teamId,
          finalRegistration: verifyResult.registration,
          transactionId: razorpayResponse.razorpay_payment_id,
          registrationComplete: true
        });
        
        toast.success('Payment successful! Registration completed.');
        
        setTimeout(() => {
          nextStep();
        }, 1500);
        
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      toast.error(error.message || 'Payment verification failed. Please contact support.');
      setProcessing(false);
    }
  };

  // Get registration details for display
  const getRegistrationDetails = () => {
    if (data.registrationType === 'individual') {
      const individualData = data.individualData || {};
      return {
        type: 'Individual',
        events: individualData.prelimEvents?.length || 0,
        isPremium: individualData.isPremium || false,
        needsAccommodation: individualData.needsAccommodation || false,
        details: data.personalDetails
      };
    } else {
      const teamData = data.teamData || {};
      return {
        type: 'Team',
        events: 1,
        teamName: teamData.teamName,
        teamSize: teamData.teamSize || 1,
        isPremium: teamData.isPremium || false,
        needsAccommodation: teamData.needsAccommodation || false,
        details: teamData.teamLeader,
        mainEvent: teamData.mainEvent
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
          <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Registration Type</span>
              <span className="text-white">{registrationDetails.type}</span>
            </div>
            
            {data.registrationType === 'individual' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Events Selected</span>
                  <span className="text-white">
                    {registrationDetails.isPremium ? 'All Events (Premium)' : `${registrationDetails.events} events`}
                  </span>
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
                  <span className="text-gray-300">Main Event</span>
                  <span className="text-white">{registrationDetails.mainEvent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Team Size</span>
                  <span className="text-white">{registrationDetails.teamSize} members</span>
                </div>
              </>
            )}
            
            {/* Premium Notice */}
            {registrationDetails.isPremium && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-300 font-semibold">Premium Package Included</span>
                  <span className="text-yellow-400 font-bold">+ ₹200</span>
                </div>
                <div className="text-xs text-yellow-200 mt-1">
                  Access to all individual events for your team
                </div>
              </div>
            )}
            
            {/* Total Amount Display */}
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg text-white font-semibold">Total Amount</span>
                <span className="text-2xl text-red-400 font-bold">
                  ₹{totalAmount}
                </span>
              </div>
              {registrationDetails.isPremium && (
                <div className="text-xs text-green-400 mt-1 text-center">
                  ✅ Premium package included - Access to all individual events
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rest of the component remains the same */}
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
            disabled={processing || totalAmount <= 0}
            className="flex-1 glass-button py-3 px-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Pay ₹${totalAmount}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;