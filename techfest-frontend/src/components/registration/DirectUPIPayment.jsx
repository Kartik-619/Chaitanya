import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const DirectUPIPayment = ({ amount, sessionId, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState(''); // NEW: User's actual UPI transaction ID
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute timer

  const verificationInProgress = useRef(false);
  const isMounted = useRef(true);

  const ourUpiId = '9816367020@axl';
  
  const generateTransactionReference = () => {
    return `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
  };

  const transactionReference = generateTransactionReference();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${ourUpiId}&pn=Chaitanya%202025&am=${amount}&tn=Chaitanya2025&cu=INR`)}`;

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isCompleted]);

  useEffect(() => {
    localStorage.setItem('lastUPITransaction', JSON.stringify({
      transactionReference: transactionReference,
      amount: amount,
      timestamp: Date.now(),
      sessionId: sessionId,
      initiated: true
    }));

    return () => {
      isMounted.current = false;
    };
  }, [sessionId, amount, transactionReference]);

  const handleVerifyPayment = async () => {
    // Validate UPI Transaction ID
    if (!upiTransactionId.trim()) {
      toast.error('Please enter your UPI Transaction ID');
      return;
    }

    if (upiTransactionId.length < 8) {
      toast.error('Please enter a valid UPI Transaction ID (minimum 8 characters)');
      return;
    }

    if (!paymentConfirmed) {
      toast.error('Please confirm that you have completed the payment first');
      return;
    }

    if (timeRemaining > 0) {
      toast.error(`Please wait ${timeRemaining} seconds before verifying`);
      return;
    }

    if (isCompleted) {
      toast.error('Payment already completed! Do not resubmit.');
      return;
    }

    if (verificationInProgress.current) {
      toast.error('Payment verification already in progress. Please wait...');
      return;
    }

    if (verificationAttempted) {
      toast.error('Payment verification already submitted.');
      return;
    }

    // Final confirmation
    const userConfirmed = window.confirm(
      `⚠️ FINAL CONFIRMATION:\n\n• Amount: ₹${amount}\n• UPI ID: ${ourUpiId}\n• Your Transaction ID: ${upiTransactionId}\n\nClick OK ONLY if you have actually paid!`
    );

    if (!userConfirmed) {
      return;
    }

    verificationInProgress.current = true;
    setVerificationAttempted(true);
    setProcessing(true);

    try {
      console.log('🔍 Verifying UPI payment with user transaction ID...', {
        sessionId,
        userUpiTransactionId: upiTransactionId,
        amount,
        ourUpiId
      });

      // Send to backend with user's actual UPI transaction ID
      const verifyResponse = await fetch('https://chaitanya-4r5f.onrender.com/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          upiTransactionId: upiTransactionId, // User's actual UPI transaction ID
          userProvidedUpiId: ourUpiId, // Which UPI they paid to
          amount: amount,
          transactionReference: transactionReference, // Our reference
          manualVerificationRequired: true // Flag for manual verification
        }),
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('Backend error response:', errorText);
        throw new Error(errorText || 'Payment verification failed');
      }

      const verifyResult = await verifyResponse.json();
      console.log('Verification result:', verifyResult);
      
      if (verifyResult.success) {
        setIsCompleted(true);
        verificationInProgress.current = false;
        
        toast.success('Payment details submitted! We will verify against bank records.');
        
        localStorage.removeItem('lastUPITransaction');
        
        onPaymentSuccess({
          userUpiTransactionId: upiTransactionId, // Store user's actual transaction ID
          amount: amount,
          status: 'pending_manual_verification',
          registrationId: verifyResult.registrationId,
          ourUpiId: ourUpiId,
          message: 'Manual verification with bank records required'
        });
        
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      verificationInProgress.current = false;
      setVerificationAttempted(false);
      
      let errorMessage = 'Payment verification failed';
      
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
      onPaymentFailure(error);
      
    } finally {
      setProcessing(false);
    }
  };

  const copyUPIID = () => {
    navigator.clipboard.writeText(ourUpiId);
    toast.success('UPI ID copied to clipboard!');
  };

  if (isCompleted) {
    return (
      <div className="glass-card p-4 sm:p-6 border-2 border-green-500/20">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
            Payment Details Submitted!
          </h3>
          <p className="text-sm sm:text-base text-gray-300">
            Your payment information has been recorded
          </p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-green-400 font-semibold text-xs sm:text-sm break-all">
            Your UPI Transaction ID: {upiTransactionId}
          </p>
          <p className="text-green-300 text-xs sm:text-sm mt-2">Amount: ₹{amount}</p>
          <p className="text-green-300 text-xs sm:text-sm">
            Paid to: <span className="text-blue-400">{ourUpiId}</span>
          </p>
          <p className="text-green-300 text-xs sm:text-sm mt-2">
            Status: <span className="text-yellow-400">Pending Bank Verification</span>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-yellow-400 text-sm font-semibold mb-2">
            📧 ID cards will be sent after bank verification
          </p>
          <p className="text-gray-400 text-xs">
            We will verify your transaction ID ({upiTransactionId}) against our bank records.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Contact us if you provided wrong transaction ID: chaitanyahptu@gmail.com
          </p>
        </div>

        {/* Continue Button */}
        <div className="mt-6">
          <button
            onClick={() => onPaymentSuccess({
              userUpiTransactionId: upiTransactionId,
              amount: amount,
              status: 'pending_verification',
              registrationId: 'pending'
            })}
            className="w-full glass-button py-3 font-medium text-sm sm:text-base"
          >
            Continue to Confirmation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 border-2 border-green-500/20">
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-xl sm:text-2xl">💳</span>
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">Pay with UPI</h3>
        <p className="text-sm sm:text-base text-gray-300">Scan QR code and enter your UPI Transaction ID</p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-center border-2 border-green-500/30">
        <p className="text-gray-300 text-xs sm:text-sm mb-1">Amount to Pay</p>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400">₹{amount}</p>
        <p className="text-xs text-green-300 mt-1">
          Pay to: <strong>{ourUpiId}</strong>
        </p>
      </div>

      {/* QR Code Section */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl inline-block mb-3 sm:mb-4 border-2 sm:border-4 border-green-500 shadow-lg">
          <img 
            src={qrCodeUrl} 
            alt="UPI Payment QR Code"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto"
            onError={(e) => {
              console.error('QR code failed to load');
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`UPI:${ourUpiId}&AMOUNT:${amount}&NOTE:Chaitanya2025`)}`;
            }}
          />
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-gray-300">
            <strong>Scan with:</strong> Google Pay, PhonePe, Paytm, BHIM, or any UPI app
          </p>
          <p className="text-xs text-green-400 break-all">
            UPI ID: <strong>{ourUpiId}</strong> • Amount: <strong>₹{amount}</strong>
          </p>
        </div>
      </div>

      {/* NEW: UPI Transaction ID Input */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-center space-x-2 text-purple-400 mb-3">
          <span className="text-lg">🔢</span>
          <span className="font-semibold text-sm">Enter Your UPI Transaction ID</span>
        </div>
        
        <div className="space-y-2">
          <label className="block text-purple-300 text-sm font-medium mb-2">
            After payment, enter the Transaction ID from your UPI app:
          </label>
          <input
            type="text"
            value={upiTransactionId}
            onChange={(e) => setUpiTransactionId(e.target.value.toUpperCase())}
            placeholder="Enter UPI Transaction ID (e.g., 123456789012)"
            className="w-full glass-input px-3 py-2 text-white placeholder-gray-400 text-sm"
            disabled={timeRemaining > 0}
          />
          <div className="flex items-center space-x-2 text-purple-200 text-xs">
            <span>💡</span>
            <span>Find this in your UPI app under "Transaction History"</span>
          </div>
          
          {timeRemaining > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mt-2">
              <p className="text-yellow-300 text-xs text-center">
                ⏰ Available in {timeRemaining} seconds (simulates payment processing)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h4 className="font-semibold text-blue-400 mb-2 sm:mb-3 text-center text-sm sm:text-base">How to Pay & Verify:</h4>
        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">1.</span>
            <span>Scan QR code and pay ₹{amount} to <strong>{ourUpiId}</strong></span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">2.</span>
            <span>Go to your UPI app → Transaction History</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">3.</span>
            <span>Find the transaction and copy the <strong>Transaction ID</strong></span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">4.</span>
            <span>Enter the Transaction ID above</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">5.</span>
            <span>Confirm and submit for verification</span>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="space-y-3 sm:space-y-4">
        {/* Payment Confirmation Checkbox */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={paymentConfirmed}
              onChange={(e) => setPaymentConfirmed(e.target.checked)}
              className="w-4 h-4 mt-1 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              disabled={timeRemaining > 0 || !upiTransactionId.trim()}
            />
            <div>
              <span className="font-semibold text-blue-400 text-sm">Confirm Payment</span>
              <p className="text-blue-300 text-xs mt-1">
                ✅ I have paid ₹{amount} to {ourUpiId} and entered the correct Transaction ID
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleVerifyPayment}
          disabled={processing || verificationAttempted || !paymentConfirmed || !upiTransactionId.trim() || timeRemaining > 0}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Submitting Payment Details...</span>
            </>
          ) : timeRemaining > 0 ? (
            <>
              <span>⏰</span>
              <span>Wait {timeRemaining}s to Verify</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Submit for Manual Verification</span>
            </>
          )}
        </button>
      </div>

      {/* Manual Verification Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
          <span>⚠️</span>
          <span className="font-semibold text-sm">Manual Bank Verification</span>
        </div>
        <p className="text-yellow-300 text-xs">
          • We will verify your Transaction ID <strong>{upiTransactionId || '______'}</strong> against bank records<br/>
          • ID cards will be sent within 24 hours after verification<br/>
          • Fake or incorrect Transaction IDs will be rejected<br/>
          • Contact: chaitanyahptu@gmail.com for issues
        </p>
      </div>
    </div>
  );
};

export default DirectUPIPayment;
