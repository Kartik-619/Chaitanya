import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PersonalDetails = ({ data, updateData, nextStep }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    registrationType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // FIXED - send nested teamHead structure
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // ✅ BETTER VALIDATION: Check each field individually
  if (!formData.name?.trim()) {
    toast.error('Please enter your full name');
    return;
  }
  
  if (!formData.email?.trim()) {
    toast.error('Please enter your email address');
    return;
  }
  
  if (!formData.phone?.trim()) {
    toast.error('Please enter your phone number');
    return;
  }
  
  if (!formData.college?.trim()) {
    toast.error('Please enter your college name');
    return;
  }
  
  if (!formData.registrationType) {
    toast.error('Please select registration type');
    return;
  }

  setLoading(true);

  try {
    console.log('📤 Sending registration data:', formData);
    
    const response = await fetch('http://localhost:5000/api/register/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // ✅ Send as FLAT structure (your current format)
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        registrationType: formData.registrationType
      }),
    });

    const result = await response.json();
    console.log('📥 Registration response:', result);

    if (result.success) {
      updateData({
        personalDetails: formData,
        registrationType: formData.registrationType,
        sessionId: result.sessionId
      });
      nextStep();
      toast.success('OTP sent to your email and phone!');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    toast.error('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Personal Details
        </h2>
        <p className="text-gray-300">Start your Chaitanya 2025 journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3"
              placeholder="10-digit Indian number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              College/University *
            </label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3"
              placeholder="Enter your college name"
              required
            />
          </div>
        </div>

        {/* Registration Type */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-4">
            Registration Type *
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { value: 'individual', label: 'Individual', desc: 'Participate in prelim events' },
              { value: 'team', label: 'Team', desc: 'Form a team for main events' }
            ].map((type) => (
              <label
                key={type.value}
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                  formData.registrationType === type.value
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-transparent hover:border-red-500/50'
                }`}
              >
                <input
                  type="radio"
                  name="registrationType"
                  value={type.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    formData.registrationType === type.value
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-500'
                  }`}>
                    {formData.registrationType === type.value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{type.label}</div>
                    <div className="text-sm text-gray-300">{type.desc}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="glass-button w-full py-4 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Continue to OTP Verification'
          )}
        </button>
      </form>
    </div>
  );
};

export default PersonalDetails;