import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const DirectUPIPayment = ({ amount, sessionId, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Your UPI ID
  const upiId = 'poojan4604@okicici';
  
  // Generate transaction ID and UPI link
  const generateUPIPayment = () => {
    const newTransactionId = `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    const note = `Chaitanya 2025 Registration - ${newTransactionId}`;
    
    // UPI payment link with EXACT amount
    const upiLink = `upi://pay?pa=${upiId}&pn=Chaitanya%202025&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    
    return {
      upiLink,
      transactionId: newTransactionId,
      qrValue: upiLink
    };
  };

  const handlePayNow = () => {
    const { upiLink, transactionId: newTxId } = generateUPIPayment();
    setTransactionId(newTxId);
    setPaymentInitiated(true);
    
    // Try to open UPI app automatically
    window.location.href = upiLink;
    
    // Store transaction for verification
    localStorage.setItem('lastUPITransaction', JSON.stringify({
      transactionId: newTxId,
      amount: amount,
      timestamp: Date.now()
    }));
    
    toast.success('Opening UPI app... Complete payment and return here');
  };

  const handleVerifyPayment = async () => {
    if (!transactionId) {
      toast.error('Please initiate payment first');
      return;
    }

    setProcessing(true);
    
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
        throw new Error(errorText || 'Payment verification failed');
      }

      const verifyResult = await verifyResponse.json();
      
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

  const { upiLink, qrValue } = generateUPIPayment();

  return (
    <div className="glass-card p-6 border-2 border-green-500/20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💳</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pay with UPI</h3>
        <p className="text-gray-300">Instant payment - Everything auto-filled</p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 mb-6 text-center border-2 border-green-500/30">
        <p className="text-gray-300 text-sm mb-1">Amount to Pay</p>
        <p className="text-4xl font-bold text-green-400">₹{amount}</p>
        <p className="text-xs text-green-300 mt-1">✅ Exact amount auto-filled in UPI app</p>
      </div>

      {!paymentInitiated ? (
        // Payment Initiation Section
        <div className="space-y-4">
          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl inline-block mb-3 border-2 border-green-500">
              <QRCode 
                value={qrValue} 
                size={180}
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Scan QR code with any UPI app
            </p>
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handlePayNow}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center justify-center space-x-2"
          >
            <span>📱</span>
            <span>Open UPI App - ₹{amount}</span>
          </button>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2 text-center">How to Pay:</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">•</span>
                <span>Click "Open UPI App" above</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">•</span>
                <span>OR scan QR code with UPI app</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">•</span>
                <span>Amount & UPI ID are auto-filled</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">•</span>
                <span>Enter UPI PIN and complete payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">•</span>
                <span>Return here and verify payment</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Payment Verification Section
        <div className="space-y-4">
          {/* Payment Status */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
              <span>⏳</span>
              <span className="font-semibold">Payment Initiated</span>
            </div>
            <p className="text-yellow-300 text-sm text-center">
              Complete payment in your UPI app and return here
            </p>
            <p className="text-xs text-yellow-400 text-center mt-2">
              Transaction ID: <code className="bg-black/30 px-2 py-1 rounded">{transactionId}</code>
            </p>
          </div>

          {/* QR Code (Still show for reference) */}
          <div className="text-center">
            <div className="bg-white p-3 rounded-xl inline-block mb-2 border border-green-500/30">
              <QRCode 
                value={qrValue} 
                size={120}
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-400">
              Still need to pay? Scan QR code above
            </p>
          </div>

          {/* Verify Payment Button */}
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
                <span>I've Completed Payment - Verify Now</span>
              </>
            )}
          </button>

          {/* Retry Payment Button */}
          <button
            onClick={() => {
              setPaymentInitiated(false);
              setTransactionId('');
            }}
            className="w-full glass-input py-3 px-6 font-medium hover:bg-white/10 transition-colors rounded-lg text-sm"
          >
            Restart Payment Process
          </button>
        </div>
      )}

      {/* Supported UPI Apps */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <p className="text-center text-gray-400 text-sm mb-3">Supported UPI Apps</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'GPay', color: 'bg-blue-500' },
            { name: 'PhonePe', color: 'bg-purple-600' },
            { name: 'Paytm', color: 'bg-blue-600' },
            { name: 'BHIM', color: 'bg-orange-500' }
          ].map((app) => (
            <div key={app.name} className={`${app.color} rounded-lg p-2 text-center text-white text-xs font-bold`}>
              {app.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectUPIPayment;