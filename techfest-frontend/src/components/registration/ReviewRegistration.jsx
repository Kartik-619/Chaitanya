import React from 'react';
import { toast } from 'react-hot-toast';

const ReviewRegistration = ({ data, updateData, nextStep, prevStep }) => {
  const isIndividual = data.registrationType === 'individual';
  const registrationData = isIndividual ? data.individualData : data.teamData;

  // Event prices for display - UPDATED
  const eventPrices = {
    "Integration Bee": 299,
    "Human vs AI": 299,
    "Retro Theming": 199,
    "Prompt Engineering": 199,
    "Reverse Engineering": 199,
    "Jack of Hearts": 399,
    "Singing": 99,
    "Dancing": 99
  };

  // Team event base prices
  const teamEventPrices = {
    "Singing": 99,
    "Dance": 99,
    "Hackathon": 999,
    "Accurate Prediction": 999,
    "E-sports": 999,
    "Polymath": 499,
    "Reverse Engineering": 199,
    "Retro Theming": 199,
    "Debate": 199,
    "Two Minute Manager": 149
  };

  // Calculate total amount based on actual stored data
  const calculateTotalAmount = () => {
    if (isIndividual) {
      return data.individualData?.totalAmount || 0;
    } else {
      return data.teamData?.totalAmount || 0;
    }
  };

  const totalAmount = calculateTotalAmount();

  const handleSubmit = async () => {
    try {
      // Verify the amount before proceeding
      console.log('💰 Final amount being sent to payment:', totalAmount);
      
      const response = await fetch('https://chaitanya-4r5f.onrender.com/api/register/review', {
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

  // Calculate team breakdown
  const getTeamBreakdown = () => {
    if (!isIndividual && registrationData) {
      const basePrice = teamEventPrices[registrationData.mainEvent] || 0;
      const teamSize = registrationData.teamSize || 1;
      
      switch (registrationData.mainEvent) {
        case 'Hackathon':
          return {
            base: 999,
            additional: Math.max(0, (teamSize - 3)) * 249,
            description: `Base (3 members): ₹999 + Additional (${Math.max(0, (teamSize - 3))} members × ₹249)`
          };
        case 'Accurate Prediction':
          return {
            base: 999,
            additional: Math.max(0, (teamSize - 2)) * 249,
            description: `Base (2 members): ₹999 + Additional (${Math.max(0, (teamSize - 2))} members × ₹249)`
          };
        case 'Polymath':
          return {
            base: 499,
            additional: Math.max(0, (teamSize - 2)) * 249,
            description: `Base (2 members): ₹499 + Additional (${Math.max(0, (teamSize - 2))} members × ₹249)`
          };
        case 'E-sports':
          return {
            base: 999,
            additional: 0,
            description: 'Fixed team price (4 members)'
          };
        default:
          // Per-person pricing
          return {
            base: basePrice * teamSize,
            additional: 0,
            description: `${teamSize} members × ₹${basePrice}`
          };
      }
    }
    return null;
  };

  const teamBreakdown = getTeamBreakdown();

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
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Full Name:</span>
              <p className="text-white font-medium">{data.personalDetails?.name}</p>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <p className="text-white font-medium">{data.personalDetails?.email}</p>
            </div>
            <div>
              <span className="text-gray-400">Phone:</span>
              <p className="text-white font-medium">{data.personalDetails?.phone}</p>
            </div>
            <div>
              <span className="text-gray-400">College:</span>
              <p className="text-white font-medium">{data.personalDetails?.college}</p>
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isIndividual ? 'Individual Registration' : 'Team Registration'}
          </h3>
          
          {isIndividual ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Registration Type:</span>
                <span className="text-white bg-green-500/20 px-3 py-1 rounded-full text-sm">Individual</span>
              </div>
              
              {/* Premium Package */}
              {registrationData?.isPremium && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-yellow-400 font-semibold">🌟 Premium Package</span>
                      <div className="text-xs text-yellow-300 mt-1">Access to all individual events</div>
                    </div>
                    <span className="text-yellow-400 font-bold">₹200</span>
                  </div>
                </div>
              )}
              
              {/* Individual Events */}
              {!registrationData?.isPremium && registrationData?.prelimEvents && registrationData.prelimEvents.length > 0 && (
                <div>
                  <span className="text-gray-300">Selected Events:</span>
                  <div className="mt-2 space-y-2">
                    {registrationData.prelimEvents.map((event, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-gray-300">• {event}</span>
                        <span className="text-white font-medium">₹{eventPrices[event] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Events Included (Premium) */}
              {registrationData?.isPremium && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 font-semibold">✅ All Individual Events Included</div>
                  <div className="text-xs text-green-300 mt-1">
                    Integration Bee, Human vs AI, Retro Theming, Prompt Engineering, Reverse Engineering, Jack of Hearts, Singing, Dancing
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Registration Type:</span>
                <span className="text-white bg-blue-500/20 px-3 py-1 rounded-full text-sm">Team</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-300">Team Name:</span>
                  <p className="text-white font-medium">{registrationData?.teamName}</p>
                </div>
                <div>
                  <span className="text-gray-300">Main Event:</span>
                  <p className="text-white font-medium">{registrationData?.mainEvent}</p>
                </div>
                <div>
                  <span className="text-gray-300">Team Size:</span>
                  <p className="text-white font-medium">{registrationData?.teamSize} members</p>
                </div>
                {registrationData?.esportsGame && (
                  <div>
                    <span className="text-gray-300">E-sports Game:</span>
                    <p className="text-white font-medium">{registrationData.esportsGame}</p>
                  </div>
                )}
              </div>
 
              {/* ✅ PREMIUM PACKAGE INFO FOR TEAMS */}
              {registrationData?.isPremium && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-yellow-400 font-semibold">🌟 Premium Package Included</span>
                      <div className="text-xs text-yellow-300 mt-1">
                        All {registrationData?.teamSize} team members get access to ALL individual events
                      </div>
                    </div>
                    <span className="text-yellow-400 font-bold">₹200</span>
                  </div>
                  <div className="text-yellow-300 text-xs mt-2">
                    ✅ Integration Bee, Human vs AI, Retro Theming, Prompt Engineering, Reverse Engineering, Jack of Hearts, Singing, Dancing
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Accommodation */}
        {(registrationData?.needsAccommodation) && (
          <div className="glass-card p-6 bg-blue-500/10 border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Accommodation Details
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">🏨 3-Day Accommodation</div>
                <div className="text-sm text-gray-300">
                  {isIndividual ? 'Single person stay' : `${registrationData?.teamSize} team members`}
                </div>
              </div>
              <div className="text-blue-400 font-bold text-lg">
                ₹{isIndividual ? 600 : 600 * (registrationData?.teamSize || 1)}
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Payment Summary
          </h3>
          <div className="space-y-3">
            {/* Individual Registration Breakdown */}
            {isIndividual && (
              <>
                {/* Premium Package */}
                {registrationData?.isPremium && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Premium Package</span>
                    <span className="text-white font-medium">₹200</span>
                  </div>
                )}
                
                {/* Individual Events */}
                {!registrationData?.isPremium && registrationData?.prelimEvents?.map((event, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{event}</span>
                    <span className="text-white">₹{eventPrices[event] || 0}</span>
                  </div>
                ))}
              </>
            )}

            {/* Team Registration Breakdown */}
            {!isIndividual && teamBreakdown && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{registrationData?.mainEvent} Team</span>
                  <span className="text-white">₹{teamBreakdown.base}</span>
                </div>
                {teamBreakdown.additional > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 ml-4">Additional members</span>
                    <span className="text-white">₹{teamBreakdown.additional}</span>
                  </div>
                )}
                {/*  ADDED PREMIUM PACKAGE IN TEAM BREAKDOWN */}
                {registrationData?.isPremium && (
                  <div className="flex justify-between items-center text-sm bg-yellow-500/10 p-2 rounded">
                    <span className="text-yellow-400">Premium Package</span>
                    <span className="text-yellow-400 font-bold">₹200</span>
                  </div>
                )}
                <div className="text-xs text-gray-400 text-center">
                  {teamBreakdown.description}
                </div>
              </>
            )}

            {/* Accommodation */}
            {registrationData?.needsAccommodation && (
              <div className="flex justify-between items-center border-t border-white/20 pt-2">
                <span className="text-gray-300">Accommodation</span>
                <span className="text-white font-medium">
                  ₹{isIndividual ? 600 : 600 * (registrationData?.teamSize || 1)}
                </span>
              </div>
            )}
            
            {/* Total */}
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg text-white font-semibold">Total Amount</span>
                <span className="text-2xl text-red-400 font-bold">
                  ₹{totalAmount}
                </span>
              </div>
              {totalAmount === 0 && (
                <div className="text-center text-green-400 text-sm mt-2">
                  🎉 Free registration! No payment required.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="glass-card p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-yellow-200">
              <strong>Please review carefully:</strong> Once you proceed to payment, your registration details cannot be changed. 
              Ensure all information is correct before continuing.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={prevStep}
            className="flex-1 glass-input py-3 font-medium hover:bg-white/10 transition-colors rounded-lg"
          >
            Back to Edit
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 glass-button py-3 font-medium rounded-lg"
          >
            {totalAmount === 0 ? 'Complete Registration (Free)' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewRegistration;