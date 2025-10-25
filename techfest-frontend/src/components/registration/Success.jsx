import React from 'react';
import { toast } from 'react-hot-toast';

const Success = ({ data }) => {
  // Extract data with proper fallbacks
  const paymentResult = data.paymentResult || {};
  const finalRegistration = paymentResult.finalRegistration || data.finalRegistration;
  
  const registrationId = paymentResult.registrationId || 
                       finalRegistration?.registrationId || 
                       data.registrationId || 'Pending';
  
  const transactionId = paymentResult.upiTransactionId ||
                       paymentResult.paymentDetails?.transactionId ||
                       finalRegistration?.paymentDetails?.transactionId ||
                       data.upiTransactionId ||
                       'Pending Verification';

  const totalAmount = finalRegistration?.totalAmount ||
                     paymentResult.amount ||
                     data.individualData?.totalAmount ||
                     data.teamData?.totalAmount || 0;

  const personalDetails = finalRegistration?.personalDetails || 
                         finalRegistration?.teamLeader || 
                         data.personalDetails || 
                         data.teamData?.teamLeader || 
                         { name: 'Participant', email: 'your email' };

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
    toast.success('Your ID card will be sent to your email within 48 hours!');
  };

  const handleBackToHome = () => {
    window.location.href = "https://chaitanyahptu.tech/";
  };

  const handleCopyRegistrationId = () => {
    navigator.clipboard.writeText(registrationId);
    toast.success('Registration ID copied to clipboard!');
  };

  // Check if accommodation was selected
  const hasAccommodation = data.individualData?.needsAccommodation || 
                          data.teamData?.needsAccommodation ||
                          finalRegistration?.needsAccommodation;

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 animate-fade-in text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3 sm:mb-4">
        Registration Submitted!
      </h2>
      
      <p className="text-lg sm:text-xl text-gray-300 mb-2">
        Welcome to Chaitanya 2025
      </p>
      
      <p className="text-gray-400 mb-6 sm:mb-8">
        {isIndividual 
          ? 'Your individual registration has been submitted.' 
          : 'Your team registration has been submitted.'
        }
      </p>

      {/* Manual Verification Notice */}
      <div className="glass-card p-4 sm:p-6 max-w-2xl mx-auto mb-6 sm:mb-8 bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <span className="text-2xl mr-3">⏳</span>
          <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">Manual Verification in Progress</h3>
        </div>
        <div className="space-y-3 text-left text-sm sm:text-base text-yellow-200">
          <div className="flex items-start space-x-3">
            <span className="text-lg">✅</span>
            <div>
              <span className="font-semibold">Payment Received</span>
              <p className="text-yellow-300 text-xs sm:text-sm mt-1">We have received your payment submission</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">📧</span>
            <div>
              <span className="font-semibold">ID Cards Within 48 Hours</span>
              <p className="text-yellow-300 text-xs sm:text-sm mt-1">Your ID cards will be sent to your email after manual verification</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">🔍</span>
            <div>
              <span className="font-semibold">Keep Payment Screenshot</span>
              <p className="text-yellow-300 text-xs sm:text-sm mt-1">Save your UPI payment confirmation screenshot for reference</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div className="glass-card p-4 sm:p-6 max-w-md mx-auto mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center border-b border-white/10 pb-2">
          Registration Details
        </h3>
        
        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
          {/* Registration ID */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Registration ID:</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono bg-black/30 px-2 py-1 rounded text-xs sm:text-sm">
                {registrationId}
              </span>
              <button
                onClick={handleCopyRegistrationId}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Copy Registration ID"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction ID:</span>
            <span className="text-green-400 font-mono bg-black/30 px-2 py-1 rounded text-xs">
              {transactionId.substring(0, 12)}...
            </span>
          </div>

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
            <span className="text-white text-sm sm:text-base">{personalDetails.name}</span>
          </div>
          
          {/* Email */}
          {personalDetails.email && (
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white text-xs sm:text-sm break-all">{personalDetails.email}</span>
            </div>
          )}
          
          {/* Amount Paid */}
          <div className="flex justify-between border-t border-white/10 pt-3">
            <span className="text-gray-400 font-semibold">Amount Paid:</span>
            <span className="text-green-400 font-bold text-base sm:text-lg">₹{totalAmount}</span>
          </div>
          
          {/* Payment Status */}
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Status:</span>
            <span className="text-yellow-400 font-semibold flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Under Verification
            </span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="glass-card p-4 sm:p-6 max-w-md mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center border-b border-white/10 pb-2">
          Event Information
        </h3>
        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
          {/* Events Summary */}
          <div>
            <span className="text-gray-300 block mb-2">Event Type:</span>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white font-semibold">{eventsInfo.type}</div>
              <div className="text-gray-300 text-xs sm:text-sm mt-1">{eventsInfo.description}</div>
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
            <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
              {eventsInfo.events.map((event, index) => (
                <div key={index} className="flex items-center text-xs sm:text-sm bg-white/5 rounded px-2 sm:px-3 py-1 sm:py-2">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white text-xs sm:text-sm">{event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ADD PROJECT BAZAAR SECTION HERE */}
          {registrationData?.projectBazaar && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 mt-2">
              <div className="flex items-center">
                <span className="text-purple-400 mr-2">🎨</span>
                <span className="text-purple-300 font-semibold">Project Bazaar (Free Team Event)</span>
              </div>
            </div>
          )}

          {/* Accommodation Info */}
          {hasAccommodation && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 sm:p-3">
              <div className="flex items-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-blue-400 font-semibold text-sm">Accommodation Booked</span>
              </div>
              <div className="text-blue-300 text-xs mt-1">
                ✅ 3-day stay confirmed • ✅ Food included • ✅ Secure accommodation
              </div>
            </div>
          )}

          {/* Event Venue & Date */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-300">Venue:</span>
              <span className="text-white">HPTU Campus</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm mt-1">
              <span className="text-gray-300">Date:</span>
              <span className="text-white">November 6-8, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
        <button
          onClick={handleDownloadTicket}
          className="glass-button px-6 sm:px-8 py-2 sm:py-3 font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-transform text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Ticket</span>
        </button>
        
        <button
          onClick={handleBackToHome}
          className="glass-input px-6 sm:px-8 py-2 sm:py-3 font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 border border-white/20 hover:border-white/40 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Back To Home</span>
        </button>
      </div>

      {/* Contact Information */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
        <p className="text-gray-400 mb-2 text-sm sm:text-base">
          Need help or have questions about your registration?
        </p>
        <p className="text-gray-400 text-xs sm:text-sm">
          Contact us at{' '}
          <a 
            href="mailto:chaitanyahptu@gmail.com" 
            className="text-red-400 hover:text-red-300 font-medium underline"
          >
            chaitanyahptu@gmail.com
          </a>
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Please include your Registration ID in your email for faster support.
        </p>
      </div>

      {/* Success Celebration */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="inline-flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Registration Submitted for Chaitanya 2025!</span>
        </div>
      </div>
    </div>
  );
};

export default Success;
