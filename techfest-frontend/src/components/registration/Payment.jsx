import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DirectUPIPayment from './DirectUPIPayment';

const Payment = ({ data, updateData, nextStep, prevStep }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay with any UPI app - Google Pay, PhonePe, Paytm',
      icon: '📱'
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

    return true;
  };

  const handleUPIPaymentSuccess = async (paymentData) => {
    if (!validatePayment()) {
      return;
    }

    setProcessing(true);

    try {
      console.log('🔍 Starting UPI payment process...');
      console.log('Session ID:', data.sessionId);
      console.log('Total Amount to be paid:', totalAmount);

      // Verify UPI payment automatically
      const verifyResponse = await fetch('https://chaitanya-4r5f.onrender.com/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          upiTransactionId: paymentData.upiTransactionId,
          amount: totalAmount
        }),
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('❌ UPI payment verification failed:', verifyResponse.status, errorText);
        
        let errorMessage = 'UPI payment verification failed';
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

      const verifyResult = await verifyResponse.json();
      console.log('📋 UPI verification result:', verifyResult);

      if (verifyResult.success) {
        updateData({
          paymentResult: verifyResult,
          registrationId: verifyResult.registrationId,
          teamId: verifyResult.teamId,
          finalRegistration: verifyResult.finalRegistration,
          transactionId: paymentData.upiTransactionId,
          registrationComplete: true
        });
        
        toast.success('UPI payment successful! Registration completed.');
        
        setTimeout(() => {
          nextStep();
        }, 1500);
        
      } else {
        throw new Error(verifyResult.message || 'UPI payment verification failed');
      }

    } catch (error) {
      console.error('❌ UPI payment error:', error);
      toast.error(error.message || 'UPI payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleUPIPaymentFailure = (error) => {
    console.error('UPI payment failed:', error);
    toast.error('UPI payment initiation failed. Please try again.');
    setProcessing(false);
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

        {/* UPI Payment Section */}
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

          {/* UPI Payment Component */}
          {paymentMethod === 'upi' && (
            <div className="mt-6">
              <DirectUPIPayment
                amount={totalAmount}
                onPaymentSuccess={handleUPIPaymentSuccess}
                onPaymentFailure={handleUPIPaymentFailure}
              />
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
};

export default Payment;