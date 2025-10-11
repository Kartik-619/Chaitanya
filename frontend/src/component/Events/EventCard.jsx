// src/components/Events/EventCard.jsx
import React from 'react';
export default function EventCard({ event, onClick, onHoverStart, onHoverEnd }) {
  return (
    <div
      className="relative w-96 h-64 flex-shrink-0 rounded-3xl overflow-hidden group cursor-pointer"
      onClick={() => onClick?.(event)}
      onMouseEnter={() => onHoverStart?.(event)}
      onMouseLeave={() => onHoverEnd?.(event)}
      role="button"
      tabIndex={0}
    >
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${event.color}ee, transparent 70%)` }} />
      <div className="absolute bottom-0 p-6">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: event.color }}>{event.category}</div>
        <h3 className="text-2xl font-bold">{event.title}</h3>
        <p className="text-sm text-white/80">{event.shortDesc || event.desc}</p>
      </div>
    </div>
  );
}
