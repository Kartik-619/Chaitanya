import React, { useEffect, useRef } from 'react';
import EventSection from '../component/Events/EventSection';
import './EventPage.css';
import Sidebar from '../component/navbar';
import Social from '../component/socials';

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
    <div id="event-page-container" className="event-page-container">
      {/* Background */}
      <div id="background-container" className="background-container">
        <div id="background-gradient" className="background-gradient">
          {/* Cloud Layers */}
          <div
            ref={cloud1Ref}
            id="cloud-layer-1"
            className="cloud-layer cloud-layer-1"
          ></div>
          <div
            ref={cloud2Ref}
            id="cloud-layer-2"
            className="cloud-layer cloud-layer-2"
          ></div>
          <div
            ref={cloud3Ref}
            id="cloud-layer-3"
            className="cloud-layer cloud-layer-3"
          ></div>

          {/* Sparkles */}
          <div
            ref={sparkleRef}
            id="sparkle-overlay"
            className="sparkle-overlay"
          ></div>
        </div>
      </div>

      {/* Foreground Content */}
      <div id="content-container" className="content-container">
        <EventSection />
      </div>
      <Sidebar/>
      <Social/>
    </div>
  );
}