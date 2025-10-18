import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './hero.css';
import Sidebar from './navbar';
import Social from './socials';
import { getSimpleImageUrl } from '../utils/cloudinary'; // ADD THIS LINE

gsap.registerPlugin(ScrollTrigger);

const setupDesktopAnimations = (heroRef, cloudRefs, scrollDuration) => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroRef.current,
      start: "top top",
      end: `+=${scrollDuration}`,
      scrub: 1.5,
      pin: true,
      pinSpacing: false,
      onEnterBack: () => gsap.to(".social", { opacity: 1 }),
      onLeave: () => gsap.to(".social", { opacity: 0 }),
    },
  });

  tl.to([cloudRefs.left1.current, cloudRefs.left2.current], {
    xPercent: -100,
    opacity: 0,
    stagger: 0.4
  }, 0);

  tl.to([cloudRefs.right1.current, cloudRefs.right2.current], {
    xPercent: 100,
    opacity: 0,
    stagger: 0.4
  }, 0);

  tl.fromTo([".welcome", ".name"], 
    { opacity: 0, y: 50 }, 
    { opacity: 1, y: 0, stagger: 0.3 }, 
    "<0.4"
  );

  tl.to(".castle", { scale: 1.05 }, "<");
  tl.to(".scroll", { opacity: 0 }, "-=0.5");
  tl.to(".social", { opacity: 0 }, "-=0.5");

  return tl;
};

const setupStaticView = () => {
  // Kill all ScrollTriggers and reset all elements to visible state
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  
  // Ensure everything is visible and in default position
  gsap.set([".welcome", ".name", ".social", ".scroll", ".castle"], { 
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    clearProps: "all" 
  });
};

export default function Hero() {
  const heroRef = useRef();
  const cloudRefs = {
    left1: useRef(),
    left2: useRef(),
    right1: useRef(),
    right2: useRef()
  };

  const [deviceType, setDeviceType] = useState("desktop");

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      // Only consider devices > 1024px as desktop for animations
      if (width > 2085) {
        setDeviceType("desktop");
      } else {
        // Everything else (tablets and mobiles) gets static view
        setDeviceType("static");
      }
      ScrollTrigger.refresh();
    };
   
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useGSAP(() => {
    if (deviceType === "static") {
      setupStaticView();
    } else {
      // Apply animations only for desktop
      setupDesktopAnimations(heroRef, cloudRefs, 800);
    }
  }, { scope: heroRef, dependencies: [deviceType] });

  return (
    <div ref={heroRef} className={`hero ${deviceType}-layout`}>
      <div className="bg" />

      {/* ONLY CHANGE IMAGE SOURCES - KEEP EVERYTHING ELSE */}
      <img src={getSimpleImageUrl('fest/castle_rqfln4')} alt="Castle" className="castle" />

      {/* Show clouds only on desktop and tablet - hide on mobile */}
      {deviceType !== "static" && (
        <>
          <img ref={cloudRefs.left1} src={getSimpleImageUrl('fest/cloudLeft_bsofo7')} alt="Cloud Left" className="cloudLeft" />
          <img ref={cloudRefs.left2} src={getSimpleImageUrl('fest/cloud_1_l2qd7g')} alt="Cloud 1" className="cloud1" />
          <img ref={cloudRefs.right1} src={getSimpleImageUrl('fest/cloud2_othzfm')} alt="Cloud 2" className="cloud2" />
          <img ref={cloudRefs.right2} src={getSimpleImageUrl('fest/cloud_right1_qibfp4')} alt="Cloud Right" className="cloudRight" />
        </>
      )}

      <div className="text-container price-font">
        <h1 className='welcome'>HPTU Presents</h1>
        <h1 className='name'>Chaitanya 1.0</h1>
      </div>

      <Sidebar />

      {/* Show scroll indicator only on desktop */}
      {deviceType === "desktop" && (
        <div className="scroll">
          <FontAwesomeIcon icon={faArrowDown} className="text-4xl text-white drop-shadow-lg" />
          <h4 className="text-white text-xl font-medium drop-shadow-md">scroll down</h4>
        </div>
      )}

  
    </div>
  );
}
