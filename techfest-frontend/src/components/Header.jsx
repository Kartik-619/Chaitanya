import React from 'react';

const Header = ({ currentView, setCurrentView }) => {
  return (
    <header className="relative z-20">
      <nav className="container mx-auto px-4 py-6">
        <div className="glass-card p-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                  Chaitanya 2025
                </h1>
                <p className="text-sm text-gray-300">HPTU Technical Festival</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex space-x-1 glass-card p-2 rounded-xl">
              {[
                { id: 'registration', label: 'Register' },
                { id: 'events', label: 'Events' },
                { id: 'about', label: 'About' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                    currentView === item.id
                      ? 'glass-button text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;