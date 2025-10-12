import React, { useState } from 'react';
import PersonalDetails from './registration/PersonalDetails';
import OTPVerification from './registration/OTPVerification';
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
    otpVerified: false,
    individualData: null,
    teamData: null,
    reviewData: null,
    paymentResult: null
  });

  const steps = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'OTP Verification' },
    { number: 3, title: registrationData.registrationType === 'individual' ? 'Select Events' : 'Team Setup' },
    { number: 4, title: 'Review' },
    { number: 5, title: 'Payment' },
    { number: 6, title: 'Complete' }
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
        return (
          <OTPVerification
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
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
      case 4:
        return (
          <ReviewRegistration
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <Payment
            data={registrationData}
            updateData={updateRegistrationData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
        return <Success data={registrationData} />;
      default:
        return <PersonalDetails data={registrationData} updateData={updateRegistrationData} nextStep={nextStep} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="glass-card p-6 mb-8 max-w-4xl mx-auto">
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

      {/* Current Step Content */}
      <div className="max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default RegistrationFlow;