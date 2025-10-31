import React, { useState } from 'react';
import PersonalDetails from './registration/PersonalDetails';
import IndividualSetup from './registration/IndividualSetup';
import TeamSetup from './registration/TeamSetup';
import ReviewRegistration from './registration/ReviewRegistration';
import Payment from './registration/Payment';
import Success from './registration/Success';
  
const RegistrationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    personalDetails: null,
    registrationType: '',
    sessionId: '',
    individualData: null,
    teamData: null,
    reviewData: null,
    paymentResult: null
  });

  const steps = [
    { number: 1, title: 'Personal Details', shortTitle: 'Personal' },
    { number: 2, 
      title: registrationData.registrationType === 'individual' ? 'Events Selection' : 'Team Setup', 
      shortTitle: registrationData.registrationType === 'individual' ? 'Events' : 'Team' 
    },
    { number: 3, title: 'Review', shortTitle: 'Review' },
    { number: 4, title: 'Payment', shortTitle: 'Payment' },
    { number: 5, title: 'Complete', shortTitle: 'Complete' }
  ];

  const updateRegistrationData = (newData) => {
    setRegistrationData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetails
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
          />
        );
      case 2:
        return registrationData.registrationType === 'individual' ? (
          <IndividualSetup
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        ) : (
          <TeamSetup
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <ReviewRegistration
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <Payment
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return <Success data={registrationData} />;
      default:
        return <PersonalDetails data={registrationData} updateData={updateRegistrationData} nextStep={nextStep} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Progress Steps */}
      <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 max-w-4xl mx-auto">
        {/* Desktop Steps */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-red-600 border-red-600 text-white animate-glow'
                      : 'border-gray-500 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-sm mt-2 text-center ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
            
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-600 -z-10">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mobile Steps */}
        <div className="md:hidden">
          <div className="flex items-center justify-between relative mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-gray-500 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-xs mt-1 text-center ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.shortTitle}
                </span>
              </div>
            ))}
            
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-600 -z-10">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
          
          {/* Current step description for mobile */}
          <div className="text-center">
            <span className="text-sm font-medium text-white">
              {steps[currentStep - 1]?.title}
            </span>
            {currentStep === 3 && (
              <span className="text-xs text-gray-300 block mt-1">
                {registrationData.registrationType === 'individual' 
                  ? 'Select preliminary events' 
                  : 'Setup team and events'
                }
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default RegistrationFlow;
