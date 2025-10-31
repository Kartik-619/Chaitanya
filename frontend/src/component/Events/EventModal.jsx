// src/components/events/EventModal.jsx
import React, { useEffect } from 'react';
import { X, ArrowLeft, Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react';

export default function EventModal({ event, onClose, onBack, activeTab, setActiveTab, onRegister }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Register clicked for event:', event?.title);
    
    if (onRegister) {
      // Use the parent component's register handler
      onRegister();
    } else {
      // Fallback: close modal and navigate to techfest-frontend
      if (onClose) onClose();
      setTimeout(() => {
        window.open('http://localhost:3001', '_blank');
      }, 100);
    }
  };

  if (!event) return null;

  return (
    <div className="event-modal-overlay">
      <div className="event-modal-container">
        {/* Back Button */}
        <button
          className="event-modal-back-btn"
          onClick={() => onBack?.()}
          title="Go Back"
        >
          <ArrowLeft className="event-modal-icon" />
        </button>

        {/* Close Button */}
        <button
          className="event-modal-close-btn"
          onClick={onClose}
          title="Close"
        >
          <X className="event-modal-icon" />
        </button>

        {/* Header Image */}
        <div className="event-modal-header">
          <img src={event.image} alt={event.title} className="event-modal-image" />
          <div 
            className="event-modal-gradient"
            style={{ background: `linear-gradient(to top, ${event.color}, transparent)` }}
          />
          <div className="event-modal-header-content">
            <div 
              className="event-modal-category"
              style={{ background: event.color }}
            >
              {event.category || 'Event'}
            </div>
            <h2 className="event-modal-title">{event.title}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="event-modal-tabs">
          {['overview', 'schedule', 'highlights'].map(tab => (
            <button
              key={tab}
              className="event-modal-tab"
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

        {/* Content */}
        <div className="event-modal-content">
          {activeTab === 'overview' && (
            <div>
              <p className="event-modal-description">{event.fullDesc}</p>
              <div className="event-modal-details-grid">
                {[
                  { icon: Calendar, label: 'Date', value: event.date },
                  { icon: Clock, label: 'Time', value: event.time },
                  { icon: MapPin, label: 'Venue', value: event.venue },
                  { icon: Users, label: 'Participants', value: event.participants },
                  { icon: Trophy, label: 'Prize', value: event.prize }
                ].filter(i => i.value).map((item, idx) => (
                  <div key={idx} className="event-detail-item">
                    <item.icon className="event-detail-icon" style={{ color: event.color }} />
                    <div>
                      <h4 className="event-detail-label">{item.label}</h4>
                      <p className="event-detail-value">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="event-register-btn w-full"
                style={{ background: event.color }}
                onClick={handleRegisterClick}
              >
                Register Now
              </button>
            </div>
          )}

          {activeTab === 'schedule' && event.schedule && (
            <div className="event-schedule-timeline">
              <div className="event-timeline-line" />
              {event.schedule.map((item, idx) => (
                <div key={idx} className="event-timeline-item">
                  <div 
                    className="event-timeline-dot"
                    style={{ 
                      background: event.color,
                      border: '3px solid #000'
                    }} 
                  />
                  <div className="event-timeline-content">
                    <div 
                      className="event-timeline-time"
                      style={{ color: event.color }}
                    >
                      {item.time}
                    </div>
                    <div className="event-timeline-activity">{item.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'highlights' && event.highlights && (
            <div className="event-highlights-list">
              {event.highlights.map((h, i) =>{ 
                 const key = Object.keys(h)[0]; // Get the first key
                 const value = Object.values(h)[0];
                return(
                <div key={i} className="event-highlight-item">
                  <div 
                    className="event-highlight-icon"
                    style={{ 
                      background: `${event.color}20`, 
                      color: event.color 
                    }}
                  >
                    ✓
                  </div><p className='event-highlight-heading'>{key}   </p>
                  <p className="event-highlight-text">{value}</p>
                </div>
              )})}
            </div>
          )}

          {!event.schedule && !event.highlights && (
            <div className="event-no-details">
              <p className="event-no-details-text">More details coming soon!</p>
              <button 
                className="event-interest-btn"
                style={{ background: event.color }}
                onClick={handleRegisterClick}
              >
                Register Interest
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
  .event-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 16px;
  }

  @media (min-width: 768px) {
    .event-modal-overlay {
      padding: 32px;
    }
  }

  .event-modal-container {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    max-width: 56rem;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border: 2px solid rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .event-modal-back-btn,
  .event-modal-close-btn {
    position: absolute;
    top: 24px;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
    cursor: pointer;
    z-index: 10;
  }

  .event-modal-back-btn {
    left: 24px;
  }

  .event-modal-back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .event-modal-back-btn:hover .event-modal-icon {
    transform: translateX(-4px);
  }

  .event-modal-close-btn {
    right: 24px;
    font-weight: bold;
    color: white;
    font-size: 1rem;
  }

  .event-modal-close-btn:hover {
    background: rgba(43, 40, 40, 0.2);
    transform: rotate(90deg);
  }

  .event-modal-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
    font-weight: bold;
    color: black;
    font-size: 1rem;
  }

  .event-modal-header {
    position: relative;
    height: 320px;
  }

  .event-modal-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .event-modal-gradient {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .event-modal-header-content {
    position: absolute;
    bottom: 32px;
    left: 32px;
    right: 32px;
  }

  .event-modal-category {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .event-modal-title {
    font-size: 2.25rem;
    font-weight: 700;
    color: white;
    margin: 0;
    line-height: 1.2;
    word-wrap: break-word;
  }

  .event-modal-tabs {
    display: flex;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    padding: 0 32px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .event-modal-tabs::-webkit-scrollbar {
    display: none;
  }

  .event-modal-tab {
    padding: 16px 32px;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    background: none;
    border: none;
    text-transform: capitalize;
    font-size: 1rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .event-modal-tab:hover {
    color: white;
  }

  .event-modal-content {
    padding: 32px;
  }

  .event-modal-description {
    color: #9ca3af;
    font-size: 1.125rem;
    line-height: 1.75;
    margin-bottom: 32px;
    word-wrap: break-word;
  }

  .event-modal-details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }

  @media (min-width: 640px) {
    .event-modal-details-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .event-modal-details-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .event-detail-item {
    display: flex;
    gap: 16px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    align-items: flex-start;
  }

  .event-detail-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .event-detail-label {
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .event-detail-value {
    color: #9ca3af;
    margin: 0;
    word-wrap: break-word;
  }

  .event-register-btn,
  .event-interest-btn {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    color: white;
    font-size: 1.125rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    touch-action: manipulation;
  }

  .event-register-btn:hover,
  .event-interest-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .event-schedule-timeline {
    position: relative;
    padding-left: 32px;
  }

  .event-timeline-line {
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }

  .event-timeline-item {
    position: relative;
    padding-bottom: 32px;
  }

  .event-timeline-dot {
    position: absolute;
    left: -30px;
    top: 8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }

  .event-timeline-content {
    padding-left: 16px;
  }

  .event-timeline-time {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 1rem;
  }

  .event-timeline-activity {
    color: #9ca3af;
    word-wrap: break-word;
  }

  .event-highlights-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .event-highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
  }

  .event-highlight-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .event-highlight-text {
    color: #d1d5db;
    line-height: 1.75;
    font-size: 1.1rem;
    margin: 0;
    flex: 1;
    min-width: 200px;
    word-wrap: break-word;
  }

  .event-highlight-heading {
    color: rgb(224, 218, 218);
    line-height: 1.75;
    font-size: 1.1rem;
    font-weight: bold;
    margin: 0;
    flex: 1;
    min-width: 200px;
    word-wrap: break-word;
  }

  .event-no-details {
    text-align: center;
    padding: 32px 0;
  }

  .event-no-details-text {
    color: #9ca3af;
    margin-bottom: 16px;
    font-size: 1.125rem;
  }

  .event-interest-btn {
    width: auto;
    padding: 12px 32px;
  }

  /* Enhanced Responsive Design */
  @media (max-width: 1024px) {
    .event-modal-container {
      max-width: 90vw;
    }
    
    .event-modal-header {
      height: 280px;
    }
    
    .event-modal-title {
      font-size: 2rem;
    }
  }

  @media (max-width: 768px) {
    .event-modal-header {
      height: 240px;
    }

    .event-modal-header-content {
      bottom: 24px;
      left: 24px;
      right: 24px;
    }

    .event-modal-title {
      font-size: 1.875rem;
    }

    .event-modal-tabs {
      padding: 0 24px;
    }

    .event-modal-tab {
      padding: 12px 16px;
      font-size: 0.875rem;
    }

    .event-modal-content {
      padding: 24px;
    }

    .event-modal-description {
      font-size: 1rem;
    }

    .event-schedule-timeline {
      padding-left: 24px;
    }

    .event-timeline-dot {
      left: -28px;
    }
    
    .event-highlight-item {
      flex-direction: column;
      gap: 12px;
    }
    
    .event-highlight-heading,
    .event-highlight-text {
      min-width: auto;
      flex: none;
    }
  }

  @media (max-width: 640px) {
    .event-modal-overlay {
      padding: 8px;
    }

    .event-modal-container {
      max-height: 95vh;
      border-radius: 20px;
    }

    .event-modal-back-btn,
    .event-modal-close-btn {
      width: 40px;
      height: 40px;
      top: 16px;
    }

    .event-modal-back-btn {
      left: 16px;
    }

    .event-modal-close-btn {
      right: 16px;
    }

    .event-modal-icon {
      width: 20px;
      height: 20px;
    }

    .event-modal-header {
      height: 200px;
    }

    .event-modal-header-content {
      bottom: 16px;
      left: 16px;
      right: 16px;
    }

    .event-modal-category {
      padding: 6px 12px;
      font-size: 0.75rem;
    }

    .event-modal-title {
      font-size: 1.5rem;
    }

    .event-modal-tabs {
      padding: 0 16px;
    }

    .event-modal-tab {
      padding: 8px 12px;
      font-size: 0.75rem;
    }

    .event-modal-content {
      padding: 16px;
    }

    .event-detail-item {
      padding: 16px;
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    .event-highlight-item {
      padding: 16px;
      text-align: center;
    }

    .event-modal-details-grid {
      gap: 16px;
    }

    .event-schedule-timeline {
      padding-left: 20px;
    }

    .event-timeline-dot {
      left: -26px;
      width: 14px;
      height: 14px;
    }

    .event-register-btn,
    .event-interest-btn {
      padding: 14px;
      font-size: 1rem;
    }
  }

  @media (max-width: 380px) {
    .event-modal-header {
      height: 180px;
    }

    .event-modal-title {
      font-size: 1.25rem;
    }

    .event-modal-tabs {
      padding: 0 12px;
    }

    .event-modal-tab {
      padding: 6px 10px;
      font-size: 0.7rem;
    }

    .event-modal-content {
      padding: 12px;
    }

    .event-modal-description {
      font-size: 0.9rem;
      margin-bottom: 24px;
    }

    .event-detail-item {
      padding: 12px;
    }

    .event-highlight-item {
      padding: 12px;
    }
  }

  /* Prevent horizontal scroll on very small devices */
  @media (max-width: 320px) {
    .event-modal-overlay {
      padding: 4px;
    }
    
    .event-modal-container {
      border-radius: 16px;
    }
    
    .event-modal-header-content {
      bottom: 12px;
      left: 12px;
      right: 12px;
    }
  }

  /* Improved touch targets for mobile */
  @media (pointer: coarse) {
    .event-modal-back-btn,
    .event-modal-close-btn {
      min-width: 44px;
      min-height: 44px;
    }

    .event-modal-tab {
      min-height: 44px;
    }

    .event-register-btn,
    .event-interest-btn {
      min-height: 44px;
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .event-modal-back-btn,
    .event-modal-close-btn,
    .event-modal-tab,
    .event-register-btn,
    .event-interest-btn {
      transition: none;
    }
    
    .event-modal-back-btn:hover .event-modal-icon,
    .event-modal-close-btn:hover {
      transform: none;
    }
  }
`}</style>
    </div>
  );
}