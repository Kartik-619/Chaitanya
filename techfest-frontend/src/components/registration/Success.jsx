import React from 'react';
import { toast } from 'react-hot-toast';

const Success = ({ data }) => {
  // Comprehensive data extraction with proper fallbacks
  const paymentResult = data.paymentResult || {};
  const finalRegistration = paymentResult.finalRegistration || data.finalRegistration;
  
  // Extract all necessary data with proper fallbacks
  const registrationId = paymentResult.registrationId || 
                       finalRegistration?.registrationId || 
                       data.registrationId || 'Pending';
  
  const teamId = paymentResult.teamId || 
                finalRegistration?.teamId || 
                data.teamId;
  
  const transactionId = paymentResult.paymentDetails?.transactionId ||
                       finalRegistration?.paymentDetails?.transactionId ||
                       paymentResult.paymentId ||
                       data.transactionId;
  
  const orderId = paymentResult.paymentDetails?.orderId ||
                 finalRegistration?.paymentDetails?.orderId ||
                 paymentResult.orderId;
  
  const totalAmount = finalRegistration?.totalAmount ||
                     paymentResult.amount ||
                     data.individualData?.totalAmount ||
                     data.teamData?.totalAmount || 0;

  const personalDetails = finalRegistration?.personalDetails || 
                         finalRegistration?.teamLeader || 
                         data.personalDetails || 
                         data.teamData?.teamLeader || 
                         { name: 'Participant' };

  const isIndividual = data.registrationType === 'individual';
  const registrationType = isIndividual ? 'Individual' : 'Team';

  // Get events information
  const getEventsInfo = () => {
    if (isIndividual) {
      const individualData = data.individualData || finalRegistration;
      if (individualData?.isPremium) {
        return {
          type: 'Premium Package',
          events: ['All Individual Events Included'],
          description: 'Access to all 8 individual events'
        };
      } else {
        return {
          type: 'Individual Events',
          events: individualData?.prelimEvents || [],
          description: `${individualData?.prelimEvents?.length || 0} events selected`
        };
      }
    } else {
      const teamData = data.teamData || finalRegistration;
      return {
        type: 'Team Event',
        events: [teamData?.mainEvent || 'Main Team Event'],
        description: teamData?.esportsGame ? `${teamData.mainEvent} - ${teamData.esportsGame}` : teamData?.mainEvent,
        teamSize: teamData?.teamSize
      };
    }
  };

  const eventsInfo = getEventsInfo();

  const handleDownloadTicket = () => {
    // In a real app, this would download the PDF ticket
    toast.success('Ticket download started! Check your email for the ID card.');
  };

  const handleBackToHome = () => {
    window.location.href = "http://localhost:5173"; // Home frontend
  };

  const handleCopyRegistrationId = () => {
    navigator.clipboard.writeText(registrationId);
    toast.success('Registration ID copied to clipboard!');
  };

  const handleCopyTransactionId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      toast.success('Transaction ID copied to clipboard!');
    }
  };

  // Check if accommodation was selected
  const hasAccommodation = data.individualData?.needsAccommodation || 
                          data.teamData?.needsAccommodation ||
                          finalRegistration?.needsAccommodation;

  return (
    <div className="glass-card p-8 animate-fade-in text-center">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
        Registration Successful!
      </h2>
      
      <p className="text-xl text-gray-300 mb-2">
        Welcome to Chaitanya 2025
      </p>
      
      <p className="text-gray-400 mb-8">
        {isIndividual 
          ? 'Your individual registration has been confirmed.' 
          : 'Your team registration has been confirmed.'
        }
      </p>

      {/* Registration Details */}
      <div className="glass-card p-6 max-w-md mx-auto mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 text-center border-b border-white/10 pb-2">
          Registration Details
        </h3>
        
        <div className="space-y-4 text-left">
          {/* Registration ID */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Registration ID:</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono bg-black/30 px-2 py-1 rounded text-sm">
                {registrationId}
              </span>
              <button
                onClick={handleCopyRegistrationId}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Copy Registration ID"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Transaction ID */}
          {transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transaction ID:</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-mono bg-black/30 px-2 py-1 rounded text-xs">
                  {transactionId.substring(0, 12)}...
                </span>
                <button
                  onClick={handleCopyTransactionId}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Copy full Transaction ID"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Team ID (for team registrations) */}
          {!isIndividual && teamId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Team ID:</span>
              <span className="text-white font-mono bg-black/30 px-2 py-1 rounded text-sm">
                {teamId}
              </span>
            </div>
          )}

          {/* Registration Type */}
          <div className="flex justify-between">
            <span className="text-gray-400">Registration Type:</span>
            <span className="text-white">{registrationType}</span>
          </div>
          
          {/* Participant/Team Leader Name */}
          <div className="flex justify-between">
            <span className="text-gray-400">
              {isIndividual ? 'Participant:' : 'Team Leader:'}
            </span>
            <span className="text-white">{personalDetails.name}</span>
          </div>
          
          {/* Email */}
          {personalDetails.email && (
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white text-sm">{personalDetails.email}</span>
            </div>
          )}

          {/* College */}
          {personalDetails.college && (
            <div className="flex justify-between">
              <span className="text-gray-400">College:</span>
              <span className="text-white text-sm text-right">{personalDetails.college}</span>
            </div>
          )}
          
          {/* Amount Paid */}
          <div className="flex justify-between border-t border-white/10 pt-3">
            <span className="text-gray-400 font-semibold">Amount Paid:</span>
            <span className="text-green-400 font-bold text-lg">₹{totalAmount}</span>
          </div>
          
          {/* Payment Status */}
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Status:</span>
            <span className="text-green-400 font-semibold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completed
            </span>
          </div>

          {/* Order ID (if available) */}
          {orderId && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Order ID:</span>
              <span className="text-gray-400 font-mono">{orderId.substring(0, 10)}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="glass-card p-6 max-w-md mx-auto mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <h3 className="text-lg font-semibold text-white mb-4 text-center border-b border-white/10 pb-2">
          Event Information
        </h3>
        <div className="space-y-4 text-left">
          {/* Events Summary */}
          <div>
            <span className="text-gray-300 block mb-2">Event Type:</span>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white font-semibold">{eventsInfo.type}</div>
              <div className="text-gray-300 text-sm mt-1">{eventsInfo.description}</div>
              {eventsInfo.teamSize && (
                <div className="text-blue-400 text-xs mt-1">Team Size: {eventsInfo.teamSize} members</div>
              )}
            </div>
          </div>

          {/* Events List */}
          <div>
            <span className="text-gray-300 block mb-2">
              {isIndividual && data.individualData?.isPremium ? 'All Included Events:' : 'Selected Events:'}
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {eventsInfo.events.map((event, index) => (
                <div key={index} className="flex items-center text-sm bg-white/5 rounded px-3 py-2">
                  <svg className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white text-sm">{event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation Info */}
          {hasAccommodation && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-blue-400 font-semibold">Accommodation Booked</span>
              </div>
              <div className="text-blue-300 text-xs mt-1">
                ✅ 3-day stay confirmed • ✅ Food included • ✅ Secure accommodation
              </div>
            </div>
          )}

          {/* Event Venue & Date */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Venue:</span>
              <span className="text-white">HPTU Campus</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-300">Date:</span>
              <span className="text-white">November 6-8, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="glass-card p-6 max-w-2xl mx-auto mb-8 bg-blue-500/10 border-blue-500/30">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What's Next?
        </h3>
        <div className="text-left space-y-3 text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-white">Confirmation Email:</span>
              <p className="text-sm">ID cards and confirmation has been sent to your email</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">📧</span>
            </div>
            <div>
              <span className="font-medium text-white">Check Your Inbox:</span>
              <p className="text-sm">Look in both inbox and spam folder for the confirmation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">🎫</span>
            </div>
            <div>
              <span className="font-medium text-white">Bring Your ID Card:</span>
              <p className="text-sm">Carry digital or printed ID card to the event venue</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">📱</span>
            </div>
            <div>
              <span className="font-medium text-white">Stay Updated:</span>
              <p className="text-sm">Watch your email for event schedules and updates</p>
            </div>
          </div>

          {/* Premium Package Notice */}
          {isIndividual && data.individualData?.isPremium && (
            <div className="flex items-start space-x-3 bg-yellow-500/10 p-3 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">🌟</span>
              </div>
              <div>
                <span className="font-medium text-yellow-400">Premium Benefits:</span>
                <p className="text-sm text-yellow-300">You have access to ALL individual events. No additional selections needed!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Important Notes */}
      <div className="glass-card p-4 max-w-2xl mx-auto mb-8 bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-sm text-yellow-200">
            <strong>Important:</strong> Save your Registration ID ({registrationId}) and Transaction ID ({transactionId ? `${transactionId.substring(0, 8)}...` : 'N/A'}) for future reference. You'll need these for any support queries.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={handleDownloadTicket}
          className="glass-button px-8 py-3 font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Ticket</span>
        </button>
        
        <button
          onClick={handleBackToHome}
          className="glass-input px-8 py-3 font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 border border-white/20 hover:border-white/40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Back To Home</span>
        </button>
      </div>

      {/* Contact Information */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-gray-400 mb-2">
          Need help or have questions about your registration?
        </p>
        <p className="text-gray-400">
          Contact us at{' '}
          <a 
            href="mailto:chaitanyahptu@gmail.com" 
            className="text-red-400 hover:text-red-300 font-medium underline"
          >
            chaitanyahptu@gmail.com
          </a>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Please include your Registration ID in your email for faster support.
        </p>
      </div>

      {/* Success Celebration */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Successfully Registered for Chaitanya 2025!</span>
        </div>
      </div>
    </div>
  );
};

export default Success;