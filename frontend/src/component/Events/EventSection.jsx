// src/components/events/EventSection.jsx
import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Scroller from './Scroller';
import EventModal from './EventModal';
import { mainEvents, prelimEvents } from './eventData';
import './EventSection.css';
import Icon from '../icon';

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

  const handleRegister = () => {
    console.log('Registering for event:', selectedEvent?.title);
    closeEvent();
    setTimeout(() => {
      window.location.href = "https://chaitanya-subdomain.vercel.app/";
    }, 350);
  };

  return (
    <div className="event-section-container">
      {/* ✅ Background */}
      <div className="event-section-background">
        <div className="background-gradient">
          <div className="cloud-layer layer1"></div>
          <div className="cloud-layer layer2"></div>
          <div className="cloud-layer layer3"></div>
        </div>
      </div>

      {/* ✅ CHAITANYA title */}
     

      {/* ✅ Main Content */}
      <div className="event-section-content">
        {/* Featured Events */}
        <div className="featured-events-header">
          <div className="sparkles-container">
            <Icon/>
          </div>
          <h1 className="featured-title">
            Featured Events
          </h1>
          <p className="featured-subtitle">Ignite Innovation, Inspire The Future</p>
        </div>

        {/* ✅ Scroller */}
        <Scroller ref={scrollerRef} onEventClick={openEvent} />

        {/* ✅ Main Events */}
        <div className="main-events-section">
          <h2 className="section-title">Main Events</h2>
          <div className="main-events-grid">
            {mainEvents.map(ev => (
              <div 
                key={ev.id} 
                className="main-event-card"
                onClick={() => openEvent(ev)}
              >
                <div className="main-event-image-container">
                  <img src={ev.image} alt={ev.title} className="main-event-image" />
                  <div 
                    className="main-event-gradient"
                    style={{ background: `linear-gradient(to top, ${ev.color}dd, transparent)` }}
                  />
                </div>
                <div className="main-event-content">
                  <h3 className="main-event-title">{ev.title}</h3>
                  <p className="main-event-description">{ev.shortDesc}</p>
                  <div className="main-event-footer">
                    <div className="prize-amount">
                      <span>{ev.prize}</span>
                    </div>
                    <button 
                      className="view-details-btn"
                      style={{ background: ev.color }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Prelim Events */}
        <div className="prelim-events-section">
          <h2 className="section-title">Preliminary Events</h2>
          <div className="prelim-category-tabs">
            {['technical', 'nonTechnical', 'otherActivities'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActivePrelimCategory(cat)}
                className={`prelim-tab ${activePrelimCategory === cat ? 'prelim-tab-active' : 'prelim-tab-inactive'}`}
              >
                {cat === 'nonTechnical' ? 'Non-Technical' : cat === 'otherActivities' ? 'Other Activities' : 'Technical'}
              </button>
            ))}
          </div>
          <div className="prelim-events-grid">
            {prelimEvents[activePrelimCategory]?.map(ev => (
              <div 
                key={ev.id} 
                className="prelim-event-card"
                onClick={() => openEvent(ev)}
              >
                <div 
                  className="prelim-event-icon-container"
                  style={{ background: `${ev.color}30` }}
                >
                  <Sparkles className="prelim-event-icon" style={{ color: ev.color }} />
                </div>
                <h3 className="prelim-event-title">{ev.title}</h3>
                <p className="prelim-event-description">{ev.desc}</p>
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
          onRegister={handleRegister}
        />
      )}

      <style jsx="true">{`
        .event-section-container {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          overflow: visible;
          color: white;
          margin: 0;
          padding: 0;
        }

        .event-section-background {
          position: absolute;
          inset: 0;
          z-index: -10;
        }

        .background-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }

        .cloud-layer {
          position: absolute;
          width: 200%;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation-duration: 60s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .layer1 {
          animation-name: cloudFloat1;
          top: 10%;
          opacity: 0.3;
        }

        .layer2 {
          animation-name: cloudFloat2;
          top: 40%;
          opacity: 0.2;
          animation-duration: 80s;
        }

        .layer3 {
          animation-name: cloudFloat3;
          top: 70%;
          opacity: 0.15;
          animation-duration: 100s;
        }

        @keyframes cloudFloat1 {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(50%); }
        }

        @keyframes cloudFloat2 {
          0% { transform: translateX(50%); }
          100% { transform: translateX(-50%); }
        }

        @keyframes cloudFloat3 {
          0% { transform: translateX(-30%); }
          100% { transform: translateX(30%); }
        }

        .event-section-title {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 20;
        }

        .chaitanya-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: white;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
          letter-spacing: 0.1em;
          font-family: 'Anton', sans-serif;
          margin: 0;
        }

        @media (min-width: 768px) {
          .chaitanya-title {
            font-size: 3.75rem;
          }
        }

        .event-section-content {
          position: relative;
          z-index: 10;
          padding: 16px;
        }

        @media (min-width: 768px) {
          .event-section-content {
            padding: 32px;
          }
        }

        .featured-events-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .sparkles-container {
          display: inline-flex;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          margin-bottom: 16px;
        }

        .sparkles-icon {
          width: 40px;
          height: 40px;
          color: white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .featured-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 12px;
          background: linear-gradient(to right, #60a5fa, #ffffff, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (min-width: 768px) {
          .featured-title {
            font-size: 3.75rem;
          }
        }

        .featured-subtitle {
          font-size: 1.125rem;
          color: #d1d5db;
        }

        .main-events-section {
          margin-top: 96px;
          margin-bottom: 64px;
        }

        .section-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin-bottom: 32px;
          text-align: center;
        }

        .main-events-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 80rem;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .main-events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .main-event-card {
          position: relative;
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.5s ease;
        }

        .main-event-card:hover {
          transform: scale(1.05);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .main-event-image-container {
          position: relative;
          height: 224px;
          overflow: hidden;
        }

        .main-event-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .main-event-card:hover .main-event-image {
          transform: scale(1.1);
        }

        .main-event-gradient {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .main-event-content {
          padding: 24px;
        }

        .main-event-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .main-event-description {
          color: #9ca3af;
          margin-bottom: 16px;
        }

        .main-event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .prize-amount span {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .view-details-btn {
          padding: 8px 24px;
          border-radius: 9999px;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .prelim-events-section {
          margin-bottom: 64px;
        }

        .prelim-category-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .prelim-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          border: none;
        }

        .prelim-tab-active {
          background: linear-gradient(to right, #3b82f6, #ffffff);
          color: white;
          transform: scale(1.05);
        }

        .prelim-tab-inactive {
          background: rgba(17, 24, 39, 0.6);
          color: #9ca3af;
        }

        .prelim-tab-inactive:hover {
          background: rgba(31, 41, 55, 0.8);
        }

        .prelim-events-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 72rem;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .prelim-events-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .prelim-event-card {
          background: rgba(17, 24, 39, 0.6);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          text-align: center;
        }

        .prelim-event-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .prelim-event-icon-container {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          margin: 0 auto 12px auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prelim-event-icon {
          width: 28px;
          height: 28px;
        }

        .prelim-event-title {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .prelim-event-description {
          color: #9ca3af;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .event-section-content {
            padding: 16px;
          }

          .featured-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .main-events-grid {
            gap: 16px;
          }

          .main-event-image-container {
            height: 180px;
          }

          .main-event-content {
            padding: 16px;
          }

          .prelim-events-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .prelim-event-card {
            padding: 16px;
          }

          .prelim-event-icon-container {
            width: 48px;
            height: 48px;
          }

          .prelim-event-icon {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 480px) {
          .chaitanya-title {
            font-size: 1.875rem;
          }

          .featured-title {
            font-size: 1.75rem;
          }

          .prelim-events-grid {
            grid-template-columns: 1fr;
          }

          .prelim-category-tabs {
            flex-direction: column;
            align-items: center;
          }

          .prelim-tab {
            width: 200px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}