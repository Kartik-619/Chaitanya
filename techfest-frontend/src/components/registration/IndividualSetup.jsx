import React, { useState } from 'react';
import toast from 'react-hot-toast';

const IndividualSetup = ({ data, updateData, nextStep, prevStep }) => {
  const [selectedEvents, setSelectedEvents] = useState([]);

  const prelimEvents = [
    "Integration Bee",
    "Human vs AI", 
    "Retro Theming",
    "Prompt Engineering", 
    "Reverse Engineering",
    "Jack of Hearts",
    "Singing",
    "Dancing"
  ];

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
    
    // COMPULSORY accommodation fee
    total += 600;
    
    return total;
  };

  const handleSubmit = async () => {
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    const calculatedAmount = calculateTotal();
    
    try {
      const response = await fetch('https://chaitanya-4r5f.onrender.com/api/register/setup-individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          prelimEvents: selectedEvents,
          isPremium: false,
          needsAccommodation: true, // Always true now
          totalAmount: calculatedAmount
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateData({
          individualData: {
            ...result.individualData,
            totalAmount: calculatedAmount,
            isPremium: false,
            needsAccommodation: true // Always true
          }
        });
        nextStep();
      } else {
        toast.error(result.message || 'Failed to setup individual');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          Select Events
        </h2>
        <p className="text-gray-300">Choose your individual events</p>
      </div>

      <div className="space-y-6">
        {/* EVENTS GRID */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Select Individual Events</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {prelimEvents.map((event) => (
              <label
                key={event}
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
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
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedEvents.includes(event)
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-500'
                    }`}>
                      {selectedEvents.includes(event) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{event}</div>
                      <div className="text-sm text-gray-300">₹{eventPrices[event]}</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* COMPULSORY Accommodation */}
        <div className="glass-card p-6 border-2 border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-lg">🏨</span>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Accommodation - ₹600</div>
                <div className="text-sm text-gray-300">
                  3 days comfortable stay at campus hostel (Compulsory)
                </div>
              </div>
            </div>
            <div className="text-green-400 font-bold text-lg">₹600</div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            {/* Individual Events */}
            {selectedEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 ml-2">• {event}</span>
                <span className="text-white">₹{eventPrices[event]}</span>
              </div>
            ))}
            
            {/* Compulsory Accommodation */}
            <div className="flex justify-between items-center border-t border-white/20 pt-2">
              <span className="text-gray-300">Accommodation (₹600)</span>
              <span className="text-white font-medium">₹600</span>
            </div>
            
            {/* Total */}
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg text-white font-semibold">Total Amount</span>
                <span className="text-2xl text-red-400 font-bold">₹{calculateTotal()}</span>
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
            disabled={selectedEvents.length === 0}
            className="flex-1 glass-button py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualSetup;