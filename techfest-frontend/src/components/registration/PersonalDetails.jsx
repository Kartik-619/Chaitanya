import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (data.personalDetails) {
      setFormData(prev => ({
        ...prev,
        ...data.personalDetails
      }));
    }
  }, [data.personalDetails]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
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
          {/* Full Name */}
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

          {/* Email Address */}
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

          {/* Phone Number */}
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
              maxLength="10"
              required
            />
          </div>

          {/* College - Text Input */}
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
            <label
              className={`glass-card p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                formData.registrationType === 'individual'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-transparent hover:border-red-500/50'
              }`}
            >
              <input
                type="radio"
                name="registrationType"
                value="individual"
                onChange={handleChange}
                className="hidden"
              />
              <div className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                  formData.registrationType === 'individual'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {formData.registrationType === 'individual' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-lg">Individual Registration</div>
                  <div className="text-sm text-gray-300">Participate in individual events</div>
                </div>
              </div>
            </label>

            <label
              className={`glass-card p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                formData.registrationType === 'team'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-transparent hover:border-red-500/50'
              }`}
            >
              <input
                type="radio"
                name="registrationType"
                value="team"
                onChange={handleChange}
                className="hidden"
              />
              <div className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                  formData.registrationType === 'team'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {formData.registrationType === 'team' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-lg">Team Registration</div>
                  <div className="text-sm text-gray-300">Form a team for main events</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
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