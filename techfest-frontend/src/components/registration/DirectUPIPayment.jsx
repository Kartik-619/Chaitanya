import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const DirectUPIPayment = ({ amount, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Your UPI ID - replace with your actual UPI ID
  const upiId = 'priuanshuattri05@okaxis';
  
  // Generate unique transaction ID
  const generateTransactionId = () => {
    return `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
  };

  // Create UPI payment link
  const createUPIPaymentLink = () => {
    const newTransactionId = generateTransactionId();
    const note = `Chaitanya 2025 Registration - ${newTransactionId}`;
    
    // UPI Deep Link format
    const upiLink = `upi://pay?pa=${upiId}&pn=Chaitanya 2025&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    
    return { upiLink, transactionId: newTransactionId };
  };

  // Open UPI app for payment
  const openUPIApp = (upiLink, txId) => {
    console.log('🔗 Opening UPI app with link:', upiLink);
    
    // Try to open UPI app
    window.location.href = upiLink;
    
    // Store transaction ID for verification
    localStorage.setItem('lastUPITransaction', JSON.stringify({
      transactionId: txId,
      amount: amount,
      timestamp: Date.now()
    }));
  };

  // Simulate payment verification (in real scenario, this would check with your backend)
  const verifyPaymentWithBackend = async (txId) => {
    try {
      // Simulate API call to your backend
      console.log('🔍 Verifying payment with backend:', txId);
      
      // In real implementation, you would call your backend API
      // const response = await fetch('/api/verify-upi-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ transactionId: txId, amount: amount })
      // });
      
      // Simulate successful verification after 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        upiTransactionId: txId,
        message: 'Payment verified successfully'
      };
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  };

  // Handle payment initiation
  const handlePayNow = async () => {
    if (!amount || amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    setProcessing(true);

    try {
      const { upiLink, transactionId: newTxId } = createUPIPaymentLink();
      setTransactionId(newTxId);
      
      console.log('💰 Starting UPI payment:', {
        amount,
        transactionId: newTxId,
        upiId
      });

      // Open UPI app
      openUPIApp(upiLink, newTxId);

      // Set flag that payment was initiated
      setPaymentInitiated(true);

      toast.success('Opening UPI app... Complete payment there and return to this page');

    } catch (error) {
      console.error('❌ UPI payment initiation failed:', error);
      toast.error('Failed to initiate UPI payment');
      setProcessing(false);
      onPaymentFailure(error);
    }
  };

  // Handle manual verification (when user returns from UPI app)
  const handleManualVerification = async () => {
    if (!transactionId) {
      toast.error('No transaction found. Please initiate payment first.');
      return;
    }

    setProcessing(true);

    try {
      console.log('🔄 Manually verifying payment...', transactionId);
      
      const verificationResult = await verifyPaymentWithBackend(transactionId);
      
      if (verificationResult.success) {
        toast.success('Payment verified successfully!');
        
        // Call success callback with payment data
        onPaymentSuccess({
          upiTransactionId: transactionId,
          amount: amount,
          status: 'completed',
          verifiedAt: new Date().toISOString()
        });
        
      } else {
        throw new Error(verificationResult.message);
      }
      
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      toast.error(error.message || 'Payment verification failed');
      onPaymentFailure(error);
    } finally {
      setProcessing(false);
    }
  };

  // Auto-verify when component mounts (if payment was initiated)
  useEffect(() => {
    const checkPreviousPayment = async () => {
      const storedPayment = localStorage.getItem('lastUPITransaction');
      if (storedPayment) {
        const paymentData = JSON.parse(storedPayment);
        const timeDiff = Date.now() - paymentData.timestamp;
        
        // If payment was initiated less than 10 minutes ago
        if (timeDiff < 10 * 60 * 1000) {
          setTransactionId(paymentData.transactionId);
          setPaymentInitiated(true);
          console.log('🔍 Found previous payment attempt:', paymentData);
        } else {
          // Clear old payment data
          localStorage.removeItem('lastUPITransaction');
        }
      }
    };

    checkPreviousPayment();
  }, []);

  // Format amount for display
  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  return (
    <div className="glass-card p-6 border-2 border-green-500/30 bg-green-500/5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-green-400 mb-2">UPI Payment</h3>
        <p className="text-gray-300">Pay instantly with any UPI app</p>
      </div>

      {/* Payment Details */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-300">Amount to Pay:</span>
          <span className="text-2xl font-bold text-green-400">{formatAmount(amount)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">UPI ID:</span>
          <span className="text-white font-mono">{upiId}</span>
        </div>

        {transactionId && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-400">Transaction ID:</span>
            <span className="text-white font-mono text-xs">{transactionId}</span>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-400 mb-2">How to Pay:</h4>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>Click "Pay Now" below</li>
          <li>Your UPI app will open automatically</li>
          <li>Complete the payment in your UPI app</li>
          <li>Return to this page after payment</li>
          <li>Click "Verify Payment" to confirm</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!paymentInitiated ? (
          <button
            onClick={handlePayNow}
            disabled={processing}
            className="w-full glass-button bg-green-600 hover:bg-green-700 py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-300"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Preparing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Pay Now - {formatAmount(amount)}</span>
              </div>
            )}
          </button>
        ) : (
          <>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <span>⏳</span>
                <span className="text-sm">Payment initiated. Complete payment in your UPI app.</span>
              </div>
            </div>

            <button
              onClick={handleManualVerification}
              disabled={processing}
              className="w-full glass-button bg-blue-600 hover:bg-blue-700 py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-300"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>I've Completed Payment - Verify Now</span>
                </div>
              )}
            </button>

            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full glass-input py-2 px-6 font-medium hover:bg-white/10 transition-colors disabled:opacity-50 rounded-lg text-sm"
            >
              Restart Payment
            </button>
          </>
        )}
      </div>

      {/* Supported Apps */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <p className="text-center text-gray-400 text-sm mb-3">Supported UPI Apps:</p>
        <div className="flex justify-center space-x-4">
          {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app, index) => (
            <div key={app} className="text-center">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg mb-1">
                {['📱', '💜', '💰', '🇮🇳'][index]}
              </div>
              <span className="text-xs text-gray-400">{app}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Having issues? Ensure you have a UPI app installed and sufficient balance.
        </p>
      </div>
    </div>
  );
};

export default DirectUPIPayment;