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

  // Touch variables
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(0);

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

  // Touch event handlers
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }
    
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = touchStartY.current - touchEndY.current;
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaY > 50) {
      const direction = deltaY > 0 ? "down" : "up";
      handleScroll(direction, absDeltaY);
    }
  };

  const handleScroll = (direction, deltaY = 0) => {
    const now = Date.now();
    if (isAnimating || now - lastScrollTime.current < COOLDOWN_PERIOD) return;

    scrollAccumulator.current += Math.abs(deltaY);

    if (scrollAccumulator.current >= SCROLL_THRESHOLD) {
      lastScrollTime.current = now;
      scrollAccumulator.current = 0;
      handlePageFlip(direction === "down" ? "forward" : "backward");
    }
  };

  useGSAP(
    () => {
      const handleWheel = (e) => {
        const direction = e.deltaY > 0 ? "down" : "up";
        handleScroll(direction, Math.abs(e.deltaY));
      };

      const container = containerRef.current;
      
      // Add wheel event for desktop
      container.addEventListener("wheel", handleWheel, { passive: true });
      
      // Add touch events for mobile
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      };
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

      <div className="mobile-controls">
        <button 
          className="nav-button prev-button"
          onClick={() => handlePageFlip("backward")}
          disabled={isAnimating}
          aria-label="Previous page"
        >
          ‹
        </button>
        <button 
          className="nav-button next-button"
          onClick={() => handlePageFlip("forward")}
          disabled={isAnimating}
          aria-label="Next page"
        >
          ›
        </button>
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
          <div className="mobile-hint">Swipe up/down or use buttons</div>
        </div>
      )}
      {isAnimating && <div className="scroll-protection-overlay"></div>}
    </div>
  );
});

export default About;