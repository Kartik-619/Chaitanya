// src/components/Events/EventCard.jsx
import React from 'react';

export default function EventCard({ event, onClick, onHoverStart, onHoverEnd }) {
  const cardStyle = {
    position: 'relative',
    width: '384px',
    height: '256px',
    flexShrink: 0,
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.7s ease'
  };

  const contentStyle = {
    position: 'absolute',
    bottom: 0,
    padding: '24px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const categoryStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 8px 0',
    lineHeight: 1.2,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  };

  const descriptionStyle = {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    lineHeight: 1.4,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
    onHoverStart?.(event);
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.querySelector('img').style.transform = 'scale(1)';
    onHoverEnd?.(event);
  };

  const handleFocus = (e) => {
    e.currentTarget.style.outline = '2px solid #3b82f6';
    e.currentTarget.style.outlineOffset = '2px';
  };

  const handleBlur = (e) => {
    e.currentTarget.style.outline = 'none';
  };

  return (
    <div
      style={cardStyle}
      onClick={() => onClick?.(event)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="button"
      tabIndex={0}
    >
      <img
        src={event.image}
        alt={event.title}
        style={imageStyle}
        draggable={false}
      />
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${event.color}ee, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />
      <div style={contentStyle}>
        <div 
          style={{ ...categoryStyle, background: event.color }}
        >
          {event.category}
        </div>
        <h3 style={titleStyle}>{event.title}</h3>
        <p style={descriptionStyle}>{event.shortDesc || event.desc}</p>
      </div>
    </div>
  );
}