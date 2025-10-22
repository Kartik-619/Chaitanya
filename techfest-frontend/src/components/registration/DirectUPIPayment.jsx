import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const DirectUPIPayment = ({ amount, sessionId, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const verificationInProgress = useRef(false);
  const isMounted = useRef(true);

  const upiId = '9816367020@axl';
  
  const generateUPIPayment = () => {
    const transactionId = `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    const note = `Chaitanya 2025 Registration - ${transactionId}`;
    
    const upiLink = `upi://pay?pa=${upiId}&pn=Chaitanya%202025&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
    
    return {
      upiLink,
      transactionId,
      qrCodeUrl
    };
  };

  const { upiLink, transactionId, qrCodeUrl } = generateUPIPayment();

  useEffect(() => {
    localStorage.setItem('lastUPITransaction', JSON.stringify({
      transactionId: transactionId,
      amount: amount,
      timestamp: Date.now(),
      sessionId: sessionId,
      initiated: true
    }));

    return () => {
      isMounted.current = false;
    };
  }, [sessionId, amount, transactionId]);

  const handleVerifyPayment = async () => {
    if (!paymentConfirmed) {
      toast.error('Please confirm that you have completed the payment first');
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

    verificationInProgress.current = true;
    setVerificationAttempted(true);
    setProcessing(true);

    const verifyButton = document.querySelector('[data-verify-button]');
    if (verifyButton) {
      verifyButton.disabled = true;
      verifyButton.style.opacity = '0.5';
      verifyButton.style.cursor = 'not-allowed';
    }

    try {
      console.log('🔍 Verifying UPI payment...', {
        sessionId,
        upiTransactionId: transactionId,
        amount
      });

      const verifyResponse = await fetch('https://chaitanya-4r5f.onrender.com/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          upiTransactionId: transactionId,
          amount: amount
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
        
        toast.success('Payment received! Registration submitted successfully.');
        
        localStorage.removeItem('lastUPITransaction');
        
        // Call onPaymentSuccess to move to next step
        onPaymentSuccess({
          upiTransactionId: transactionId,
          amount: amount,
          status: 'under_verification',
          registrationId: verifyResult.registrationId,
          message: 'ID cards will be sent within 48 hours'
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
      
      if (errorMessage.includes('already processed') || errorMessage.includes('already completed')) {
        setIsCompleted(true);
        toast.error('This payment was already processed successfully!');
        onPaymentSuccess({
          upiTransactionId: transactionId,
          amount: amount,
          status: 'already_completed'
        });
      } else {
        toast.error(errorMessage);
        onPaymentFailure(error);
      }
      
      if (verifyButton) {
        verifyButton.disabled = false;
        verifyButton.style.opacity = '1';
        verifyButton.style.cursor = 'pointer';
      }
    } finally {
      setProcessing(false);
    }
  };

  const copyUPIID = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  // If payment is completed, show success message but DON'T auto-redirect
  // Let the parent component handle the redirect
  if (isCompleted) {
    return (
      <div className="glass-card p-4 sm:p-6 border-2 border-green-500/20">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
            Payment Received!
          </h3>
          <p className="text-sm sm:text-base text-gray-300">
            Your registration is successfully submitted
          </p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-green-400 font-semibold text-xs sm:text-sm break-all">
            Transaction ID: {transactionId}
          </p>
          <p className="text-green-300 text-xs sm:text-sm mt-2">Amount: ₹{amount}</p>
          <p className="text-green-300 text-xs sm:text-sm">
            Status: <span className="text-yellow-400">Under Verification</span>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-yellow-400 text-sm font-semibold mb-2">
            📧 ID cards will be sent to your email within 48 hours
          </p>
          <p className="text-gray-400 text-xs">
            We are manually verifying your payment. Keep your UPI transaction screenshot handy.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Contact: chaitanyahptu@gmail.com if you face any issues.
          </p>
        </div>

        {/* Continue Button */}
        <div className="mt-6">
          <button
            onClick={() => onPaymentSuccess({
              upiTransactionId: transactionId,
              amount: amount,
              status: 'completed',
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
        <p className="text-sm sm:text-base text-gray-300">Scan QR code with any UPI app</p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-center border-2 border-green-500/30">
        <p className="text-gray-300 text-xs sm:text-sm mb-1">Amount to Pay</p>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400">₹{amount}</p>
        <p className="text-xs text-green-300 mt-1">
          ✅ <strong>Auto-filled in QR</strong> - Do not change amount
        </p>
      </div>

      {/* Security Warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-center space-x-2 text-red-400 mb-1">
          <span className="text-sm">⚠️</span>
          <span className="font-semibold text-sm">Important</span>
        </div>
        <p className="text-red-300 text-xs sm:text-sm text-center">
          Pay <strong>exactly ₹{amount}</strong> as shown in QR code
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
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`UPI:${upiId}&AMOUNT:${amount}&NOTE:Chaitanya2025`)}`;
            }}
          />
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-gray-300">
            <strong>Scan with:</strong> Google Pay, PhonePe, Paytm, BHIM, or any UPI app
          </p>
          <p className="text-xs text-green-400 break-all">
            Amount: <strong>₹{amount}</strong> • Transaction: {transactionId}
          </p>
        </div>
      </div>

      {/* Hidden UPI ID Backup */}
      <div className="bg-black/20 rounded-lg p-2 sm:p-3 mb-4 sm:mb-6 text-center">
        <button 
          onClick={copyUPIID}
          className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          📋 Click here if QR doesn't work
        </button>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h4 className="font-semibold text-blue-400 mb-2 sm:mb-3 text-center text-sm sm:text-base">How to Pay:</h4>
        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">1.</span>
            <span>Open your UPI app</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">2.</span>
            <span>Tap "Scan QR Code" and scan the code above</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">3.</span>
            <span><strong>Amount ₹{amount} is auto-filled</strong> - Do not change it</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">4.</span>
            <span>Complete payment in your UPI app</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 flex-shrink-0">5.</span>
            <span>Return here and confirm payment below</span>
          </div>
        </div>
      </div>

      {/* Manual Verification Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
          <span>⚠️</span>
          <span className="font-semibold text-sm">Important Notice</span>
        </div>
        <p className="text-yellow-300 text-xs">
          • Payments require manual verification<br/>
          • Keep your UPI payment screenshot<br/>
          • ID cards will be sent within 48 hours after verification<br/>
          • Contact us if not received: chaitanyahptu@gmail.com
        </p>
      </div>

      {/* Verification Button */}
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-1 sm:mb-2">
            <span>⏳</span>
            <span className="font-semibold text-sm">Step 1: Complete Payment</span>
          </div>
          <p className="text-yellow-300 text-xs sm:text-sm text-center">
            Scan the QR code and complete payment in your UPI app first
          </p>
          <p className="text-xs text-yellow-400 text-center mt-2 break-all">
            Transaction ID: <code className="bg-black/30 px-1 sm:px-2 py-1 rounded text-xs">{transactionId}</code>
          </p>
        </div>

        {/* Payment Confirmation Checkbox */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={paymentConfirmed}
              onChange={(e) => setPaymentConfirmed(e.target.checked)}
              className="w-4 h-4 mt-1 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
            />
            <div>
              <span className="font-semibold text-blue-400 text-sm">Step 2: Confirm Payment</span>
              <p className="text-blue-300 text-xs mt-1">
                ✅ I have successfully completed the payment of ₹{amount} in my UPI app
              </p>
            </div>
          </label>
        </div>

        <button
          data-verify-button
          onClick={handleVerifyPayment}
          disabled={processing || verificationAttempted || !paymentConfirmed}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Step 3: Verify Payment Now</span>
            </>
          )}
        </button>

        {verificationAttempted && !processing && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 sm:p-3">
            <p className="text-blue-400 text-xs sm:text-sm text-center">
              ✅ Verification submitted! Please wait for confirmation...
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Security Features Display */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-600">
        <h4 className="font-semibold text-white mb-2 sm:mb-3 text-center text-sm sm:text-base">Security Features</h4>
        <div className="grid grid-cols-1 gap-1 sm:gap-2 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-green-400">
            <span>🔒</span>
            <span>Amount auto-filled in QR code</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <span>🔒</span>
            <span>Backend amount verification</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <span>🔒</span>
            <span>Unique transaction tracking</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <span>🔒</span>
            <span>Real-time payment confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectUPIPayment;
