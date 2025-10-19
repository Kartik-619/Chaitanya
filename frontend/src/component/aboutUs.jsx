import React, { useRef, useEffect,useState, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InfoContent from "./infoContent";
import AboutContent from "./aboutContent";
import EventsCarousel from "./eventOverview";

import "./about.css";
import Icon from "./icon";


gsap.registerPlugin(ScrollTrigger);

const contentComponents = [
  { id: "info", component: <InfoContent /> },
  { id: "about", component: <AboutContent /> },
  { id: "events", component: <EventsCarousel /> },
];

const About = forwardRef((props, ref) => {
  const containerRef = useRef();
  const frontPageRef = useRef();
  const backPageRef = useRef();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flipDirection, setFlipDirection] = useState("forward");

  const SCROLL_THRESHOLD = 300;
  const COOLDOWN_PERIOD = 1200;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentPage: () => currentIndex,
    goToNextPage: () => handlePageFlip("forward"),
    goToPrevPage: () => handlePageFlip("backward"),
    isAnimating: () => isAnimating
  }));

  // Notify parent about page changes
  useEffect(() => {
    if (props.onPageChange) {
      props.onPageChange(currentIndex);
    }
    
    // Dispatch custom event for global listeners
    window.dispatchEvent(new CustomEvent('aboutPageChange', {
      detail: { currentPage: currentIndex, totalPages: contentComponents.length }
    }));
  }, [currentIndex, props]);

  const handlePageFlip = (direction) => {
    if (isAnimating) return;

    const newIndex = direction === "forward" 
      ? (currentIndex + 1) % contentComponents.length
      : (currentIndex - 1 + contentComponents.length) % contentComponents.length;

    setFlipDirection(direction);
    animatePageFlip(direction, newIndex);
  };

  const animatePageFlip = (direction, newIndex) => {
    setIsAnimating(true);

    const moveDistance = 60;
    const fadeTime = 1.2;

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(newIndex);
        gsap.set(frontPageRef.current, { clearProps: "all" });
        gsap.set(backPageRef.current, { clearProps: "all" });
        setIsAnimating(false);
      },
    });

    if (direction === "forward") {
      tl.to(frontPageRef.current, {
        y: -moveDistance,
        opacity: 0,
        duration: fadeTime * 0.6,
        ease: "power2.inOut",
      }).fromTo(
        backPageRef.current,
        { y: moveDistance * 2, opacity: 0 },
        { y: 0, opacity: 1, duration: fadeTime, ease: "power3.out" },
        "-=0.5"
      );
    } else {
      tl.to(frontPageRef.current, {
        y: moveDistance,
        opacity: 0,
        duration: fadeTime * 0.6,
        ease: "power2.inOut",
      }).fromTo(
        backPageRef.current,
        { y: -moveDistance * 2, opacity: 0 },
        { y: 0, opacity: 1, duration: fadeTime, ease: "power3.out" },
        "-=0.5"
      );
    }

    tl.to(
      [frontPageRef.current, backPageRef.current],
      {
        boxShadow: direction === "forward" 
          ? "0 15px 35px rgba(0,0,0,0.25)" 
          : "0 -10px 25px rgba(0,0,0,0.2)",
        duration: fadeTime * 0.5,
        ease: "power2.inOut",
      },
      0
    ).to(
      [frontPageRef.current, backPageRef.current],
      {
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        duration: fadeTime * 0.5,
        ease: "power2.out",
      },
      fadeTime * 0.5
    );
  };

  useGSAP(
    () => {
      let scrollAccumulator = 0;
      let lastScrollTime = 0;

      const handleScroll = (direction, deltaY = 0) => {
        const now = Date.now();
        if (isAnimating || now - lastScrollTime < COOLDOWN_PERIOD) return;

        scrollAccumulator += Math.abs(deltaY);

        if (scrollAccumulator >= SCROLL_THRESHOLD) {
          lastScrollTime = now;
          scrollAccumulator = 0;
          handlePageFlip(direction === "down" ? "forward" : "backward");
        }
      };

      const handleWheel = (e) => {
        
        const direction = e.deltaY > 0 ? "down" : "up";
        handleScroll(direction, Math.abs(e.deltaY));
      };

      const container = containerRef.current;
      container.addEventListener("wheel", handleWheel, { passive: true });

      return () => container.removeEventListener("wheel", handleWheel);
    },
    { scope: containerRef, dependencies: [currentIndex, isAnimating] }
  );

  // Determine current and next pages
  const nextIndex = (currentIndex + 1) % contentComponents.length;
  const FrontComponent = contentComponents[currentIndex].component;
  const BackComponent = contentComponents[nextIndex].component;

  return (
    <div id="about-section" className="about-section1" ref={containerRef}>
      <div className="section-counter">
        {currentIndex + 1} / {contentComponents.length}
      </div>
      
    <Icon/>
      <div className="book-container">
        <div ref={frontPageRef} className="page front-page" style={{ zIndex: 2 }}>
          <div className="page-content">{FrontComponent}</div>
        </div>

        <div ref={backPageRef} className="page back-page" style={{ zIndex: 1 }}>
          <div className="page-content">{BackComponent}</div>
        </div>
      </div>

      <div
        className={`page-corner ${flipDirection} ${isAnimating ? "visible" : ""}`}
      ></div>
     
      <div className="scroll-indicators">
        {contentComponents.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>

      {!isAnimating && (
        <div className="scroll-hint">
          {currentIndex === contentComponents.length - 1 
            ? "Scroll down to continue" 
            : "Scroll to flip pages"
          }
        </div>
      )}
      {isAnimating && <div className="scroll-protection-overlay"></div>}
    </div>
  );
});

export default About;