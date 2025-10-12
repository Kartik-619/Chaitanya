// In ReviewRegistration.js - replace the entire file with this
import React from 'react';
import { toast } from 'react-hot-toast';

const ReviewRegistration = ({ data, updateData, nextStep, prevStep }) => {
  const isIndividual = data.registrationType === 'individual';
  const registrationData = isIndividual ? data.individualData : data.teamData;

  // Calculate total amount based on actual stored data
  const calculateTotalAmount = () => {
    if (isIndividual) {
      return data.individualData?.totalAmount || 0;
    } else {
      return data.teamData?.totalAmount || 0;
    }
  };

  const totalAmount = calculateTotalAmount();

  // Event prices for display
  const eventPrices = {
    "Code Forge": 200,
    "Robo Rampage": 200,
    "Integration Bee": 150,
    "Encryption/Decryption": 150,
    "Reverse Engineering": 200,
    "Bug Bounty / CTF": 300,
    "Data Analysis Challenge": 250,
    "Stock Prediction": 200,
    "Sports Analytics": 150
  };

  const handleSubmit = async () => {
    try {
      // Verify the amount before proceeding
      console.log('💰 Final amount being sent to payment:', totalAmount);
      
      const response = await fetch('http://localhost:5000/api/register/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          totalAmount: totalAmount
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateData({
          reviewData: result.registrationData,
          totalAmount: totalAmount
        });
        nextStep();
      } else {
        toast.error(result.message || 'Review failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          Review Registration
        </h2>
        <p className="text-gray-300">Please verify your details before proceeding to payment</p>
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Personal Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Full Name:</span>
              <p className="text-white">{data.personalDetails?.name}</p>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <p className="text-white">{data.personalDetails?.email}</p>
            </div>
            <div>
              <span className="text-gray-400">Phone:</span>
              <p className="text-white">{data.personalDetails?.phone}</p>
            </div>
            <div>
              <span className="text-gray-400">College:</span>
              <p className="text-white">{data.personalDetails?.college}</p>
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {isIndividual ? 'Individual Registration' : 'Team Registration'}
          </h3>
          
          {isIndividual ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Registration Type:</span>
                <span className="text-white">Individual</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-300">Selected Events:</span>
                <div className="mt-2 space-y-1">
                  {registrationData?.prelimEvents?.map((event, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-400 ml-2">• {event}</span>
                      <span className="text-white">₹{eventPrices[event] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Team Name:</span>
                <span className="text-white">{registrationData?.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Main Event:</span>
                <span className="text-white">{registrationData?.mainEvent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Team Size:</span>
                <span className="text-white">{registrationData?.teamSize} members</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Payment Summary
          </h3>
          <div className="space-y-3">
            {isIndividual && registrationData?.prelimEvents?.map((event, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{event}</span>
                <span className="text-white font-medium">₹{eventPrices[event] || 0}</span>
              </div>
            ))}
            
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg text-white font-semibold">Total Amount</span>
                <span className="text-2xl text-red-400 font-bold">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          </div>
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
            onClick={handleSubmit}
            className="flex-1 glass-button py-3 font-medium"
          >
            {totalAmount === 0 ? 'Complete Registration (Free)' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewRegistration;