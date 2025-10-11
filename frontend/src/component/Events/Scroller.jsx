// src/components/events/Scroller.jsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import EventCard from './EventCard';
import { mainEvents, prelimEvents } from './eventData';

gsap.registerPlugin(Draggable);

// Combine all events dynamically
const getAllScrollEvents = () => {
  const prelimAll = Object.values(prelimEvents).flat(); // combine technical, nonTechnical, cultural, other
  return [...mainEvents, ...prelimAll];
};

const Scroller = forwardRef(({ events, onEventClick }, ref) => {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const tlRef = useRef(null);
  const dragRef = useRef(null);

  const scrollEvents = events || getAllScrollEvents();

  const initTimeline = (startX = 0) => {
    const el = innerRef.current;
    if (!el) return;

    tlRef.current?.kill();
    tlRef.current = null;

    const children = Array.from(el.children || []);
    let blockWidth = 0;

    if (children.length >= scrollEvents.length) {
      const style = getComputedStyle(el);
      const gap = parseFloat(style.gap) || 0;
      for (let i = 0; i < scrollEvents.length; i++) {
        blockWidth += children[i].getBoundingClientRect().width;
      }
      blockWidth += gap * Math.max(0, scrollEvents.length - 1);
    }

    if (!blockWidth) blockWidth = el.scrollWidth / 3 || 100;

    gsap.set(el, { x: startX });
    const duration = Math.max(12, blockWidth / 80);

    tlRef.current = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })
      .to(el, {
        x: `-=${blockWidth}`,
        duration,
        modifiers: {
          x: (x) => {
            const num = parseFloat(x);
            if (isNaN(num)) return '0px';
            return gsap.utils.wrap(-blockWidth, 0, num) + 'px';
          },
        },
      });
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const waitImages = () => {
      const imgs = Array.from(el.querySelectorAll('img'));
      return Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })));
    };

    let resizeObserver;

    waitImages().then(() => {
      initTimeline();

      window.addEventListener('resize', () => initTimeline());
      try {
        resizeObserver = new ResizeObserver(() => initTimeline());
        resizeObserver.observe(el);
      } catch {}
    });

    return () => {
      tlRef.current?.kill();
      dragRef.current?.kill();
      window.removeEventListener('resize', initTimeline);
      resizeObserver?.disconnect();
    };
  }, [scrollEvents]);

  // Make draggable
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (dragRef.current) dragRef.current.kill();

    dragRef.current = Draggable.create(el, {
      type: 'x',
      inertia: true,
      edgeResistance: 0.75,
      onPress() {
        tlRef.current?.pause();
      },
      onRelease() {
        // Resume timeline from current position instead of start
        const currentX = gsap.getProperty(el, 'x');
        initTimeline(currentX);
      },
      onDrag() {
        if (tlRef.current) tlRef.current.timeScale(0); // freeze auto-scroll while dragging
      },
    })[0];

  }, []);

  // Cursor speed
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const handleMove = (e) => {
      const rect = host.getBoundingClientRect();
      if (!tlRef.current || !rect) return;
      const px = (e.clientX - rect.left) / rect.width;
      const speed = gsap.utils.clamp(0.25, 3, 1 + (px - 0.5) * 3);
      tlRef.current.timeScale(speed);
    };

    host.addEventListener('mousemove', handleMove);
    host.addEventListener('touchmove', (ev) => handleMove(ev.touches[0]), { passive: true });

    return () => {
      host.removeEventListener('mousemove', handleMove);
      host.removeEventListener('touchmove', (ev) => handleMove(ev.touches[0]));
    };
  }, []);

  // Wheel nudge
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const onWheel = (e) => {
      e.preventDefault();
      if (!tlRef.current) return;
      const delta = e.deltaY || e.wheelDelta || 0;
      tlRef.current.timeScale(gsap.utils.clamp(0.2, 4, Math.abs(delta) * 0.002 + 1));
      clearTimeout(host._wheelTimeout);
      host._wheelTimeout = setTimeout(() => tlRef.current.timeScale(1), 350);
    };

    host.addEventListener('wheel', onWheel, { passive: false });
    return () => host.removeEventListener('wheel', onWheel);
  }, []);

  useImperativeHandle(ref, () => ({
    pause: () => tlRef.current?.pause(),
    play: () => tlRef.current?.play(),
    reset: () => {
      tlRef.current?.pause(0);
      tlRef.current?.time(0);
      tlRef.current?.timeScale(1);
      tlRef.current?.play();
    },
    setSpeed: (s) => tlRef.current?.timeScale(s),
  }), []);

  const triple = [...scrollEvents, ...scrollEvents, ...scrollEvents];

  return (
    <div ref={containerRef} className="relative overflow-hidden py-8 cursor-grab active:cursor-grabbing">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div ref={innerRef} className="flex gap-6" style={{ width: 'max-content' }}>
        {triple.map((ev, idx) => (
          <EventCard
            key={`${ev.id}-${idx}`}
            event={ev}
            onClick={() => onEventClick?.(ev)}
            onHoverStart={() => tlRef.current?.pause()}
            onHoverEnd={() => tlRef.current?.play()}
          />
        ))}
      </div>
    </div>
  );
});

export default Scroller;
