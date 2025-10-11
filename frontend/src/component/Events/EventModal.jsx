// src/components/events/EventModal.jsx
import React, { useEffect } from 'react';
import { X, ArrowLeft, Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react';

export default function EventModal({ event, onClose, onBack, activeTab, setActiveTab }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-8">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/10 relative">
        {/* Back */}
        <button
          className="absolute top-6 left-6 w-12 h-12 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10 group"
          onClick={() => onBack?.()}
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Close */}
        <button
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:rotate-90 z-10"
          onClick={onClose}
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative h-80">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${event.color}, transparent)` }} />
          <div className="absolute bottom-8 left-8">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mb-2" style={{ background: event.color }}>{event.category || 'Event'}</div>
            <h2 className="text-4xl font-bold text-white">{event.title}</h2>
          </div>
        </div>

        <div className="flex border-b-2 border-white/10 px-8">
          {['overview', 'schedule', 'highlights'].map(tab => (
            <button
              key={tab}
              className="px-8 py-4 font-semibold transition-all duration-300 capitalize"
              style={{
                color: activeTab === tab ? 'white' : '#888',
                borderBottom: activeTab === tab ? `3px solid ${event.color}` : '3px solid transparent'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">{event.fullDesc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: Calendar, label: 'Date', value: event.date },
                  { icon: Clock, label: 'Time', value: event.time },
                  { icon: MapPin, label: 'Venue', value: event.venue },
                  { icon: Users, label: 'Participants', value: event.participants },
                  { icon: Trophy, label: 'Prize', value: event.prize }
                ].filter(i => i.value).map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-6 bg-white/5 rounded-xl border border-white/10">
                    <item.icon className="w-6 h-6" style={{ color: event.color }} />
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{item.label}</h4>
                      <p className="text-gray-400">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-xl text-white text-lg font-semibold" style={{ background: event.color }}>Register Now</button>
            </div>
          )}

          {activeTab === 'schedule' && event.schedule && (
            <div className="relative pl-8">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/10" />
              {event.schedule.map((item, idx) => (
                <div key={idx} className="relative pb-8">
                  <div className="absolute left-[-1.5rem] top-2 w-4 h-4 rounded-full border-3" style={{ background: event.color, borderColor: '#000', borderWidth: '3px' }} />
                  <div className="pl-4">
                    <div className="font-semibold mb-1" style={{ color: event.color }}>{item.time}</div>
                    <div className="text-gray-400">{item.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'highlights' && event.highlights && (
            <div className="space-y-6">
              {event.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: `${event.color}20`, color: event.color }}>✓</div>
                  <p className="text-gray-300 leading-relaxed">{h}</p>
                </div>
              ))}
            </div>
          )}

          {!event.schedule && !event.highlights && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">More details coming soon!</p>
              <button className="px-8 py-3 rounded-xl text-white font-semibold" style={{ background: event.color }}>Register Interest</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
