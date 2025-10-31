import { useState } from 'react';
import '../styles/RegisterPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Personal Details, 2: OTP Verification, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    registrationType: 'individual'
  });
  
  const [otp, setOtp] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending OTP to:', formData.email);
      
      const response = await fetch(`${API_URL}/api/register/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        setSessionId(data.sessionId);
        setStep(2);
        alert(`OTP sent to ${formData.email}! Check your inbox.`);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Make sure backend is running on ' + API_URL);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/register/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          otp
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>🎓 Chaitanya 2025 Registration</h1>
          <p>Himachal Pradesh Technical University</p>
        </div>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="register-form">
            <h2>Personal Details</h2>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
              />
            </div>

            <div className="form-group">
              <label>College/University *</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                required
                placeholder="Your college name"
              />
            </div>

            <div className="form-group">
              <label>Registration Type *</label>
              <select
                name="registrationType"
                value={formData.registrationType}
                onChange={handleInputChange}
                required
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue to OTP Verification →'}
            </button>

            <p className="info-text">
              📧 An OTP will be sent to your email for verification
            </p>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="register-form">
            <h2>Verify OTP</h2>
            
            <p className="otp-info">
              We've sent a 6-digit OTP to <strong>{formData.email}</strong>
            </p>

            <div className="form-group">
              <label>Enter OTP *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                pattern="[0-9]{6}"
                className="otp-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button 
              type="button" 
              className="back-btn"
              onClick={() => setStep(1)}
            >
              ← Back to Personal Details
            </button>

            <p className="info-text">
              Didn't receive OTP? Check your spam folder or try again.
            </p>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>OTP Verified Successfully!</h2>
            <p>Your registration is confirmed.</p>
            <p className="session-id">Session ID: {sessionId}</p>
            
            <button 
              className="submit-btn"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </button>
          </div>
        )}

        <div className="backend-status">
          <small>Backend: {API_URL}</small>
        </div>
      </div>
    </div>
  );
}
