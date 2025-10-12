import React, { useState } from 'react';
import toast from 'react-hot-toast';

const IndividualSetup = ({ data, updateData, nextStep, prevStep }) => {
  const [selectedEvents, setSelectedEvents] = useState([]);

  const prelimEvents = [
    "Code Forge",
    "Robo Rampage", 
    "Integration Bee",
    "Encryption/Decryption",
    "Reverse Engineering",
    "Bug Bounty / CTF",
    "Data Analysis Challenge",
    "Stock Prediction",
    "Sports Analytics"
  ];

  // Event prices mapping
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

  const toggleEvent = (eventName) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventName)) {
        return prev.filter(name => name !== eventName);
      } else {
        return [...prev, eventName]; // NO LIMIT - user can select all events
      }
    });
  };

  const calculateTotal = () => {
    let total = 0;
    selectedEvents.forEach(eventName => {
      total += eventPrices[eventName] || 0;
    });
    console.log('🔄 Calculating total for events:', selectedEvents, 'Total:', total);
    return total;
  };

  const handleSubmit = async () => {
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one prelim event');
      return;
    }

    const calculatedAmount = calculateTotal();
    
    try {
      const response = await fetch('http://localhost:5000/api/register/setup-individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          prelimEvents: selectedEvents,
          totalAmount: calculatedAmount // Send calculated amount explicitly
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateData({
          individualData: {
            ...result.individualData,
            totalAmount: calculatedAmount // Ensure correct amount is stored
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
          Select Prelim Events
        </h2>
        <p className="text-gray-300">Select the preliminary events you want to participate in</p>
      </div>

      <div className="space-y-6">
        {/* Events Grid */}
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

        {/* Selection Summary */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-300">Selected Events: {selectedEvents.length}</div>
              <div className="text-sm text-gray-400">
                {selectedEvents.join(', ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">₹{calculateTotal()}</div>
              <div className="text-sm text-gray-400">Total Amount</div>
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