import React from 'react';
import './EventCard.css'; // We'll move the styles here for better organization

export default function EventCard({ event, onClick, onHoverStart, onHoverEnd }) {

 const handleMouseEnter = (e) => {
 e.currentTarget.style.transform = 'translateY(-4px)';
 e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
 e.currentTarget.querySelector('.event-card-image').style.transform = 'scale(1.1)';
 onHoverStart?.(event);
};

 const handleMouseLeave = (e) => {
 e.currentTarget.style.transform = 'translateY(0)';
 e.currentTarget.style.boxShadow = 'none';
 e.currentTarget.querySelector('.event-card-image').style.transform = 'scale(1)';
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
 className="event-card-container"
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
 className="event-card-image"
 draggable={false}
 />
 <div className="event-card-overlay" style={{ background: `linear-gradient(to top, ${event.color}ee, transparent 70%)` }} />
 <div className="event-card-content">
 <div className="event-card-category" style={{ background: event.color }}>
 {event.category}
 </div>
 <h3 className="event-card-title">{event.title}</h3>
 <p className="event-card-description">{event.shortDesc || event.desc}</p>
</div>
 </div>
 );
}