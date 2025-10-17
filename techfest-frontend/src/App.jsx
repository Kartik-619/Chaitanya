import React from 'react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import RegistrationFlow from './components/RegistrationFlow';
import BackgroundAnimation from './components/BackgroundAnimation';

function App() {
  useEffect(() => {
    document.title = "Chaitanya 2025 - Register";
  }, []);
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />
      
      <main className="relative z-10">
        <RegistrationFlow />
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

export default App;