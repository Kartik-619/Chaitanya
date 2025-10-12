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
                className="event-register-btn"
                style={{ background: event.color }}
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
              {event.highlights.map((h, i) => (
                <div key={i} className="event-highlight-item">
                  <div 
                    className="event-highlight-icon"
                    style={{ 
                      background: `${event.color}20`, 
                      color: event.color 
                    }}
                  >
                    ✓
                  </div>
                  <p className="event-highlight-text">{h}</p>
                </div>
              ))}
            </div>
          )}

          {!event.schedule && !event.highlights && (
            <div className="event-no-details">
              <p className="event-no-details-text">More details coming soon!</p>
              <button 
                className="event-interest-btn"
                style={{ background: event.color }}
              >
                Register Interest
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
        }

        .event-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .event-modal-icon {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
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
        }

        .event-modal-tabs {
          display: flex;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding: 0 32px;
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
        }

        .event-modal-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (min-width: 768px) {
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
        }

        .event-detail-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
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
          margin: 0;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .event-modal-header {
            height: 240px;
          }

          .event-modal-header-content {
            bottom: 24px;
            left: 24px;
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
        }

        @media (max-width: 480px) {
          .event-modal-overlay {
            padding: 8px;
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
          }

          .event-highlight-item {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}