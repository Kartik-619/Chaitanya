// src/components/events/EventSection.jsx
import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Scroller from './Scroller';
import EventModal from './EventModal';
import { mainEvents, prelimEvents } from './eventData';
import './EventSection.css';

export default function EventSection() {
  const scrollerRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activePrelimCategory, setActivePrelimCategory] = useState('technical');

  const openEvent = (ev) => {
    setSelectedEvent(ev);
    scrollerRef.current?.pause();
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    scrollerRef.current?.play();
  };

  const onBackFromModal = () => {
    scrollerRef.current?.reset();
    setSelectedEvent(null);
  };

  return (
    <div
      className="relative w-screen min-h-screen overflow-visible text-white"
      style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}
    >
      {/* ✅ Background */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-dark-gradient relative overflow-hidden">
          <div className="cloud-layer layer1 animate-cloud1" />
          <div className="cloud-layer layer2 animate-cloud2" />
          <div className="cloud-layer layer3 animate-cloud3" />
        </div>
      </div>

      {/* ✅ CHAITANYA title */}
      <div className="absolute top-4 left-4 z-20">
        <h1
          className="text-4xl md:text-6xl font-bold text-white drop-shadow-[2px_2px_8px_rgba(0,0,0,0.8)] tracking-wider"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          CHAITANYA
        </h1>
      </div>

      {/* ✅ Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Featured Events */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-white/10 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-white to-blue-600 bg-clip-text text-transparent">
            Featured Events
          </h1>
          <p className="text-lg text-gray-300">Ignite Innovation, Inspire The Future</p>
        </div>

        {/* ✅ Scroller */}
        <Scroller ref={scrollerRef} onEventClick={openEvent} />

        {/* ✅ Main Events */}
        <div className="mt-24 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Main Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {mainEvents.map(ev => (
              <div 
                key={ev.id} 
                className="group relative bg-gray-900/80 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-white/10 cursor-pointer transition-all duration-500 hover:scale-105 hover:border-blue-500/50" 
                onClick={() => openEvent(ev)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${ev.color}dd, transparent)` }} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{ev.title}</h3>
                  <p className="text-gray-400 mb-4">{ev.shortDesc}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-sm">{ev.prize}</span>
                    </div>
                    <button className="px-6 py-2 rounded-full text-white font-semibold text-sm" style={{ background: ev.color }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Prelim Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Preliminary Events</h2>
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {['technical', 'nonTechnical', 'otherActivities'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActivePrelimCategory(cat)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activePrelimCategory === cat 
                    ? 'bg-gradient-to-r from-blue-500 to-white text-white scale-105' 
                    : 'bg-gray-900/60 text-gray-400 hover:bg-gray-800 border border-white/10'
                }`}
              >
                {cat === 'nonTechnical' ? 'Non-Technical' : cat === 'otherActivities' ? 'Other Activities' : 'Technical'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {prelimEvents[activePrelimCategory]?.map(ev => (
              <div 
                key={ev.id} 
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer hover:scale-105 text-center"
                onClick={() => openEvent(ev)}
              >
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${ev.color}30` }}>
                  <Sparkles className="w-7 h-7" style={{ color: ev.color }} />
                </div>
                <h3 className="text-white font-bold mb-2">{ev.title}</h3>
                <p className="text-gray-400 text-sm">{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={closeEvent}
          onBack={onBackFromModal}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
