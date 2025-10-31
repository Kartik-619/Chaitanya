import { API_ENDPOINTS } from '../../config/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const IndividualSetup = ({ data, updateData, nextStep, prevStep }) => {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [needsAccommodation, setNeedsAccommodation] = useState(false);

  const prelimEvents = [
    "Integration Bee",
    "Human vs AI", 
    "Retro Theming",
    "Prompt Engineering", 
    "Reverse Engineering",
    "Jack of Hearts",
    "Singing",
    "Dancing",
    "Project Bazaar"
  ];
  
  const eventPrices = {
    "Integration Bee": 99,
    "Human vs AI": 99,
    "Retro Theming": 99,
    "Prompt Engineering": 99,
    "Reverse Engineering": 99,
    "Jack of Hearts": 99,
    "Singing": 99,
    "Dancing": 99,
    "Project Bazaar": 0       
  };

  const toggleEvent = (eventName) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventName)) {
        return prev.filter(name => name !== eventName);
      } else {
        return [...prev, eventName];
      }
    });
  };

  const calculateTotal = () => {
    let total = 0;
    selectedEvents.forEach(eventName => {
      total += eventPrices[eventName] || 0;
    });
    
    // COMPULSORY food fee - ₹400
    total += 400;
    
    // OPTIONAL accommodation fee - ₹200
    if (needsAccommodation) {
      total += 200;
    }
    
    return total;
  };

  const handleSubmit = async () => {
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    const calculatedAmount = calculateTotal();
    
    try {
      console.log('🔗 API URL:', API_ENDPOINTS.SETUP_INDIVIDUAL);
      console.log('📤 Sending data:', { sessionId: data.sessionId, prelimEvents: selectedEvents });
      
      const response = await fetch(API_ENDPOINTS.SETUP_INDIVIDUAL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          prelimEvents: selectedEvents,
          isPremium: false,
          needsAccommodation: needsAccommodation,
          totalAmount: calculatedAmount
        }),
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        toast.error(`Server error: ${response.status} - ${errorText}`);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Response data:', result);

      if (result.success) {
        updateData({
          individualData: {
            ...result.individualData,
            totalAmount: calculatedAmount,
            isPremium: false,
            needsAccommodation: needsAccommodation
          }
        });
        nextStep();
      } else {
        toast.error(result.message || 'Failed to setup individual');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      toast.error(`Network error: ${error.message}`);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          Select Events
        </h2>
        <p className="text-sm sm:text-base text-gray-300">Choose your individual events</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* EVENTS GRID */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Select Individual Events</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {prelimEvents.map((event) => (
              <label
                key={event}
                className={`glass-card p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                  selectedEvents.includes(event)
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-transparent hover:border-red-500/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event)}
                  onChange={() => toggleEvent(event)}
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center ${
                      selectedEvents.includes(event)
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-500'
                    }`}>
                      {selectedEvents.includes(event) && (
                        <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-sm sm:text-base truncate">{event}</div>
                      <div className="text-xs sm:text-sm text-gray-300">₹{eventPrices[event]}</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* COMPULSORY Food */}
        <div className="glass-card p-4 sm:p-6 border-2 border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-sm sm:text-lg">🍛</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-base sm:text-lg truncate">Food Package - ₹400</div>
                <div className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                  3-day food package (Compulsory for all participants)
                </div>
              </div>
            </div>
            <div className="text-green-400 font-bold text-base sm:text-lg flex-shrink-0">₹400</div>
          </div>
        </div>

        {/* OPTIONAL Accommodation - UPDATED TEXT */}
        <div className="glass-card p-4 sm:p-6 border-2 border-blue-500/30 bg-blue-500/5">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <input
                type="checkbox"
                checked={needsAccommodation}
                onChange={(e) => setNeedsAccommodation(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-sm sm:text-lg">🏨</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-base sm:text-lg truncate">Accommodation - ₹200</div>
                <div className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                  3-day accommodation (Optional - select if needed)
                </div>
              </div>
            </div>
            <div className="text-blue-400 font-bold text-base sm:text-lg flex-shrink-0">₹200</div>
          </label>
        </div>

        {/* Selection Summary */}
        <div className="glass-card p-4 sm:p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Order Summary</h3>
          
          <div className="space-y-2 sm:space-y-3">
            {/* Individual Events */}
            {selectedEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-400 ml-2 truncate flex-1 mr-2">• {event}</span>
                <span className="text-white flex-shrink-0">₹{eventPrices[event]}</span>
              </div>
            ))}
            
            {/* Compulsory Food */}
            <div className="flex justify-between items-center border-t border-white/20 pt-2">
              <div>
                <span className="text-gray-300 text-sm">Food Package</span>
                <div className="text-xs text-gray-400">Compulsory</div>
              </div>
              <span className="text-white font-medium">₹400</span>
            </div>

            {/* Optional Accommodation - Only if selected */}
            {needsAccommodation && (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-300 text-sm">Accommodation</span>
                  <div className="text-xs text-gray-400">Optional</div>
                </div>
                <span className="text-white font-medium">₹200</span>
              </div>
            )}
            
            {/* Total */}
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg text-white font-semibold">Total Amount</span>
                <span className="text-xl sm:text-2xl text-red-400 font-bold">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={prevStep}
            className="flex-1 glass-input py-3 font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedEvents.length === 0}
            className="flex-1 glass-button py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualSetup;
