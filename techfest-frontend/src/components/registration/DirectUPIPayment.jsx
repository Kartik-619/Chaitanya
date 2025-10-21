import React, { useState } from 'react';
import toast from 'react-hot-toast';

const DirectUPIPayment = ({ amount, sessionId, onPaymentSuccess, onPaymentFailure }) => {
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Your UPI ID
  const upiId = 'priuanshuattri05@okaxis';
  
  // Generate transaction ID
  const generateTransactionId = () => {
    return `CHT${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
  };

  const handlePayNow = () => {
    const newTransactionId = generateTransactionId();
    setTransactionId(newTransactionId);
    
    // Show payment instructions
    toast.success('Please complete payment using the UPI ID below');
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

  // Copy UPI ID to clipboard
  const copyUPIID = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  // Copy amount to clipboard
  const copyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    toast.success('Amount copied to clipboard!');
  };

  return (
    <div className="glass-card p-6 border-2 border-green-500/20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💳</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pay with UPI</h3>
        <p className="text-gray-300">Instant payment with any UPI app</p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 mb-6 text-center">
        <p className="text-gray-300 text-sm mb-1">Total Amount</p>
        <p className="text-3xl font-bold text-white">₹{amount}</p>
      </div>

      {/* Payment Instructions */}
      <div className="bg-black/20 rounded-lg p-5 mb-6">
        <h4 className="font-semibold text-white mb-4 text-lg">How to Pay:</h4>
        
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="text-white font-medium">Open any UPI App</p>
              <p className="text-gray-300 text-sm">Google Pay, PhonePe, Paytm, BHIM, etc.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="text-white font-medium">Send payment to this UPI ID</p>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-black/30 px-3 py-1 rounded text-white font-mono text-sm border border-green-500/30">
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
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="text-white font-medium">Enter exact amount</p>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-black/30 px-3 py-1 rounded text-white font-mono text-sm border border-green-500/30">
                  ₹{amount}
                </code>
                <button 
                  onClick={copyAmount}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
              4
            </div>
            <div>
              <p className="text-white font-medium">Add payment note</p>
              <p className="text-gray-300 text-sm">"Chaitanya 2025 Registration"</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
              5
            </div>
            <div>
              <p className="text-white font-medium">Complete payment & verify</p>
              <p className="text-gray-300 text-sm">Return here and click Verify Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!transactionId ? (
          <button
            onClick={handlePayNow}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Start UPI Payment - ₹{amount}
          </button>
        ) : (
          <>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <span>⏳</span>
                <span className="font-medium">Payment Initiated - Complete in your UPI App</span>
              </div>
              <p className="text-yellow-300 text-sm text-center mt-1">
                Transaction ID: <code className="bg-black/30 px-2 py-1 rounded">{transactionId}</code>
              </p>
            </div>

            <button
              onClick={handleVerifyPayment}
              disabled={processing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Verify Payment</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* UPI Apps */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <p className="text-center text-gray-400 text-sm mb-4">Supported UPI Apps</p>
        <div className="grid grid-cols-4 gap-3">
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