import React, { useEffect, useRef } from 'react';
import EventSection from '../component/Events/EventSection';
import './EventPage.css';

export default function EventPage() {
  const cloud1Ref = useRef(null);
  const cloud2Ref = useRef(null);
  const cloud3Ref = useRef(null);
  const sparkleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (cloud1Ref.current)
        cloud1Ref.current.style.transform = `translateX(-5%) translateY(${scrollY * 0.02}px)`;
      if (cloud2Ref.current)
        cloud2Ref.current.style.transform = `translateX(4%) translateY(${scrollY * 0.01}px)`;
      if (cloud3Ref.current)
        cloud3Ref.current.style.transform = `translateX(-3%) translateY(${scrollY * 0.015}px)`;
      if (sparkleRef.current)
        sparkleRef.current.style.backgroundPosition = `0 ${scrollY * 0.05}px`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0f0524] via-[#1a0b2f] to-[#0f0524]">
          {/* Cloud Layers */}
          <div
            ref={cloud1Ref}
            className="absolute w-[200%] h-full bg-radial-cloud animate-cloudMovement opacity-40"
          ></div>
          <div
            ref={cloud2Ref}
            className="absolute w-[150%] h-full top-20 bg-radial-cloud2 animate-cloudMovement2 opacity-30"
          ></div>
          <div
            ref={cloud3Ref}
            className="absolute w-[180%] h-full -top-10 bg-radial-cloud3 animate-cloudMovement3 opacity-25"
          ></div>

          {/* Sparkles */}
          <div
            ref={sparkleRef}
            className="absolute inset-0 bg-sparkle-pattern opacity-20"
          ></div>
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        <EventSection />
      </div>
    </div>
  );
}
