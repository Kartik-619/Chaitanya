import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const DirectUPIPayment = ({ amount, sessionId, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Your UPI ID
  const upiId = 'priyanshuattri05@okaxis';
  
  // Generate transaction ID and QR code URL
  const generateUPIPayment = () => {
    const newTransactionId = `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    const note = `Chaitanya 2025 Registration - ${newTransactionId}`;
    
    // UPI payment link with EXACT amount
    const upiLink = `upi://pay?pa=${upiId}&pn=Chaitanya%202025&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    
    // Generate QR code using reliable service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
    
    return {
      upiLink,
      transactionId: newTransactionId,
      qrCodeUrl
    };
  };

  const { upiLink, transactionId: defaultTxId, qrCodeUrl } = generateUPIPayment();

  const handlePayNow = () => {
    const newTransactionId = `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    setTransactionId(newTransactionId);
    setPaymentInitiated(true);
    
    // Store transaction for verification
    localStorage.setItem('lastUPITransaction', JSON.stringify({
      transactionId: newTransactionId,
      amount: amount,
      timestamp: Date.now()
    }));
    
    toast.success('QR code generated! Scan with UPI app');
  };

  const handleVerifyPayment = async () => {
    if (!transactionId) {
      toast.error('Please generate QR code first');
      return;
    }

    setProcessing(true);
    
    try {
      console.log('🔍 Verifying UPI payment...', {
        sessionId,
        upiTransactionId: transactionId,
        amount
      });

      // FIXED: Proper backend call with all required fields
      const verifyResponse = await fetch('https://chaitanya-4r5f.onrender.com/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          upiTransactionId: transactionId,
          amount: amount,
          // Add these fields that backend might be expecting
          razorpay_order_id: transactionId, // Fallback for old backend
          razorpay_payment_id: `upi_${transactionId}`,
          razorpay_signature: `sig_${transactionId}`
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
        toast.success('Payment verified successfully!');
        
        // Clear stored transaction
        localStorage.removeItem('lastUPITransaction');
        
        onPaymentSuccess({
          upiTransactionId: transactionId,
          amount: amount,
          status: 'completed'
        });
        
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
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

  // Check for previous payment attempt
  useEffect(() => {
    const storedPayment = localStorage.getItem('lastUPITransaction');
    if (storedPayment) {
      const paymentData = JSON.parse(storedPayment);
      const timeDiff = Date.now() - paymentData.timestamp;
      
      // If payment was initiated less than 10 minutes ago
      if (timeDiff < 10 * 60 * 1000) {
        setTransactionId(paymentData.transactionId);
        setPaymentInitiated(true);
      } else {
        localStorage.removeItem('lastUPITransaction');
      }
    }
  }, []);

  // Copy UPI ID to clipboard
  const copyUPIID = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  return (
    <div className="glass-card p-6 border-2 border-green-500/20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💳</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pay with UPI</h3>
        <p className="text-gray-300">Scan QR code with any UPI app</p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 mb-6 text-center border-2 border-green-500/30">
        <p className="text-gray-300 text-sm mb-1">Amount to Pay</p>
        <p className="text-4xl font-bold text-green-400">₹{amount}</p>
        <p className="text-xs text-green-300 mt-1">✅ Exact amount auto-filled</p>
      </div>

      {/* QR Code Section - Always show */}
      <div className="text-center mb-6">
        <div className="bg-white p-4 rounded-xl inline-block mb-3 border-2 border-green-500">
          <img 
            src={qrCodeUrl} 
            alt="UPI Payment QR Code"
            className="w-64 h-64 mx-auto"
            onError={(e) => {
              console.error('QR code failed to load');
              // Fallback QR code
              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`UPI:${upiId}&AMOUNT:${amount}&NOTE:Chaitanya2025`)}`;
            }}
          />
        </div>
        <p className="text-sm text-gray-300 mb-2">
          Scan QR code with UPI app
        </p>
        <p className="text-xs text-green-400">
          Amount: ₹{amount} • UPI ID: {upiId}
        </p>
      </div>

      {/* UPI ID Display */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">UPI ID:</span>
          <div className="flex items-center space-x-2">
            <code className="text-white font-mono bg-black/50 px-3 py-1 rounded border border-green-500/30">
              {upiId}
            </code>
            <button 
              onClick={copyUPIID}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Or manually send ₹{amount} to this UPI ID
        </p>
      </div>

      {!paymentInitiated ? (
        // Payment Initiation Section
        <div className="space-y-4">
          <button
            onClick={handlePayNow}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center justify-center space-x-2"
          >
            <span>📱</span>
            <span>I'll Pay Now - Generate Payment</span>
          </button>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2 text-center">Instructions:</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">1.</span>
                <span>Click button above</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">2.</span>
                <span>Scan QR code with UPI app</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">3.</span>
                <span>Complete payment in UPI app</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">4.</span>
                <span>Return and click "Verify Payment"</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Payment Verification Section
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
              <span>⏳</span>
              <span className="font-semibold">Ready for Payment</span>
            </div>
            <p className="text-yellow-300 text-sm text-center">
              Scan the QR code and complete payment
            </p>
            <p className="text-xs text-yellow-400 text-center mt-2">
              Transaction ID: <code className="bg-black/30 px-2 py-1 rounded">{transactionId}</code>
            </p>
          </div>

          <button
            onClick={handleVerifyPayment}
            disabled={processing}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying Payment...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>I've Paid - Verify Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setPaymentInitiated(false);
              setTransactionId('');
            }}
            className="w-full glass-input py-3 px-6 font-medium hover:bg-white/10 transition-colors rounded-lg text-sm"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectUPIPayment;
