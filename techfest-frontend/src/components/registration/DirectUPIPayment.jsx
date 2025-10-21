import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const DirectUPIPayment = ({ amount, sessionId, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // ✅ STRONGER DUPLICATE PREVENTION
  const verificationInProgress = useRef(false);
  const isMounted = useRef(true);

  // Your UPI ID
  const upiId = 'dikshitjaswal1922@okicici';
  
  // Generate transaction ID and QR code URL with EXACT amount
  const generateUPIPayment = () => {
    const transactionId = `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    const note = `Chaitanya 2025 Registration - ${transactionId}`;
    
    // UPI link with EXACT amount
    const upiLink = `upi://pay?pa=${upiId}&pn=Chaitanya%202025&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    
    // Generate QR code with exact amount embedded
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
    
    return {
      upiLink,
      transactionId,
      qrCodeUrl
    };
  };

  const { upiLink, transactionId, qrCodeUrl } = generateUPIPayment();

  // Auto-store transaction when component loads
  useEffect(() => {
    localStorage.setItem('lastUPITransaction', JSON.stringify({
      transactionId: transactionId,
      amount: amount,
      timestamp: Date.now(),
      sessionId: sessionId,
      initiated: true
    }));

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
    };
  }, [sessionId, amount, transactionId]);

  // ✅ STRONGER DUPLICATE PREVENTION FUNCTION
  const handleVerifyPayment = async () => {
    // Level 1: Check if already completed
    if (isCompleted) {
      toast.error('Payment already completed! Do not resubmit.');
      return;
    }

    // Level 2: Check if verification already in progress
    if (verificationInProgress.current) {
      toast.error('Payment verification already in progress. Please wait...');
      return;
    }

    // Level 3: Check state
    if (verificationAttempted) {
      toast.error('Payment verification already submitted.');
      return;
    }

    // ✅ LOCK: Immediately set all flags to prevent duplicates
    verificationInProgress.current = true;
    setVerificationAttempted(true);
    setProcessing(true);

    // ✅ DISABLE BUTTON IMMEDIATELY
    const verifyButton = document.querySelector('[data-verify-button]');
    if (verifyButton) {
      verifyButton.disabled = true;
      verifyButton.style.opacity = '0.5';
      verifyButton.style.cursor = 'not-allowed';
    }

    try {
      console.log('🔍 Verifying UPI payment....', {
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
        // ✅ MARK AS COMPLETED - PREVENT ANY FURTHER ACTIONS
        setIsCompleted(true);
        verificationInProgress.current = false;
        
        toast.success('Payment verified successfully! Registration completed!');
        
        // Clear stored transaction
        localStorage.removeItem('lastUPITransaction');
        
        // ✅ Call success callback
        onPaymentSuccess({
          upiTransactionId: transactionId,
          amount: amount,
          status: 'completed',
          registrationId: verifyResult.registrationId
        });
        
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      // ✅ RESET FLAGS ON ERROR (allow retry)
      verificationInProgress.current = false;
      setVerificationAttempted(false);
      
      let errorMessage = 'Payment verification failed';
      
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = error.message || errorMessage;
      }
      
      // ✅ SPECIFIC ERROR FOR DUPLICATES
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
      
      // ✅ RE-ENABLE BUTTON ON ERROR
      if (verifyButton) {
        verifyButton.disabled = false;
        verifyButton.style.opacity = '1';
        verifyButton.style.cursor = 'pointer';
      }
    } finally {
      setProcessing(false);
    }
  };

  // Copy UPI ID to clipboard (hidden but available as backup)
  const copyUPIID = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  // ✅ PREVENT ANY ACTION IF COMPLETED
  if (isCompleted) {
    return (
      <div className="glass-card p-6 border-2 border-green-500/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Payment Completed!</h3>
          <p className="text-gray-300">Your registration was successful</p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <p className="text-green-400 font-semibold">Transaction ID: {transactionId}</p>
          <p className="text-green-300 text-sm mt-2">Amount: ₹{amount}</p>
          <p className="text-green-300 text-sm">Status: Completed</p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Please check your email for confirmation and ID card
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-2 border-green-500/20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💳</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pay with UPI</h3>
        <p className="text-gray-300">Scan QR code with any UPI app</p>
      </div>

      {/* Payment Amount - HIGHLIGHTED & LOCKED */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 mb-6 text-center border-2 border-green-500/30">
        <p className="text-gray-300 text-sm mb-1">Amount to Pay</p>
        <p className="text-4xl font-bold text-green-400">₹{amount}</p>
        <p className="text-xs text-green-300 mt-1">
          ✅ <strong>Auto-filled in QR</strong> - Do not change amount
        </p>
      </div>

      {/* Security Warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center space-x-2 text-red-400 mb-1">
          <span>⚠️</span>
          <span className="font-semibold">Important</span>
        </div>
        <p className="text-red-300 text-sm text-center">
          Pay <strong>exactly ₹{amount}</strong> as shown in QR code
        </p>
      </div>

      {/* QR Code Section - ALWAYS VISIBLE */}
      <div className="text-center mb-6">
        <div className="bg-white p-6 rounded-2xl inline-block mb-4 border-4 border-green-500 shadow-2xl">
          <img 
            src={qrCodeUrl} 
            alt="UPI Payment QR Code"
            className="w-72 h-72 mx-auto"
            onError={(e) => {
              console.error('QR code failed to load');
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`UPI:${upiId}&AMOUNT:${amount}&NOTE:Chaitanya2025`)}`;
            }}
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            <strong>Scan with:</strong> Google Pay, PhonePe, Paytm, BHIM, or any UPI app
          </p>
          <p className="text-xs text-green-400">
            Amount: <strong>₹{amount}</strong> • Transaction: {transactionId}
          </p>
        </div>
      </div>

      {/* Hidden UPI ID Backup (for support) */}
      <div className="bg-black/20 rounded-lg p-3 mb-6 text-center">
        <button 
          onClick={copyUPIID}
          className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          📋 Click here if QR doesn't work
        </button>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-400 mb-3 text-center">How to Pay:</h4>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">1.</span>
            <span>Open your UPI app</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">2.</span>
            <span>Tap "Scan QR Code" and scan the code above</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">3.</span>
            <span><strong>Amount ₹{amount} is auto-filled</strong> - Do not change it</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">4.</span>
            <span>Complete payment in your UPI app</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">5.</span>
            <span>Return here and click "I've Paid - Verify Now"</span>
          </div>
        </div>
      </div>

      {/* Verification Button */}
      <div className="space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
            <span>⏳</span>
            <span className="font-semibold">Ready for Payment</span>
          </div>
          <p className="text-yellow-300 text-sm text-center">
            Scan the QR code and complete payment in your UPI app first
          </p>
          <p className="text-xs text-yellow-400 text-center mt-2">
            Transaction ID: <code className="bg-black/30 px-2 py-1 rounded">{transactionId}</code>
          </p>
        </div>

        <button
          data-verify-button
          onClick={handleVerifyPayment}
          disabled={processing || verificationAttempted}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center space-x-2 shadow-lg"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>I've Paid ₹{amount} - Verify Now</span>
            </>
          )}
        </button>

        {verificationAttempted && !processing && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-sm text-center">
              ✅ Verification submitted! Please wait for confirmation...
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Security Features Display */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="font-semibold text-white mb-3 text-center">Security Features</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
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
