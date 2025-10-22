import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const OTPVerification = ({ data, updateData, nextStep, prevStep }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://chaitanya-4r5f.onrender.com/api/register/verify-otp', {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          otp: otpString
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateData({ otpVerified: true });
        nextStep();
        toast.success('OTP verified successfully!');
      } else {
        toast.error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(60);
    toast.success('OTP resent successfully!');
  };

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          OTP Verification
        </h2>
        <p className="text-gray-300">
          Enter the 6-digit code sent to<br />
          <span className="text-white font-medium">{data.personalDetails?.email}</span>
        </p>
        <p className="text-yellow-400 text-sm mt-2">
          📧 <strong>Check your spam folder</strong> if you don't see the OTP email
        </p>
      </div>

      <div className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputsRef.current[index] = el}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="glass-input w-14 h-14 text-center text-xl font-bold"
            />
          ))}
        </div>

        {/* Timer and Resend */}
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-gray-400">
              Resend OTP in <span className="text-red-400">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-red-400 hover:text-red-300 font-medium"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={prevStep}
            className="flex-1 glass-input py-3 font-medium hover:bg-white/10 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="flex-1 glass-button py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
