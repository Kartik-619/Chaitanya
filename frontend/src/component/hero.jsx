import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './hero.css';
import Sidebar from './navbar';
import Social from './socials';

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

const setupMobileView = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.set(".welcome, .name, .social, .scroll, .castle", { opacity: 1, y: 0, scale: 1, xPercent: 0 });
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
      if (width <= 1024) setDeviceType("mobile");
      else if (width > 1024 && width <= 1366) setDeviceType("tablet");
      else setDeviceType("desktop");
      ScrollTrigger.refresh();
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useGSAP(() => {
    if (deviceType === "mobile") setupMobileView();
    else setupDesktopAnimations(heroRef, cloudRefs, deviceType === "tablet" ? 500 : 800);
  }, { scope: heroRef, dependencies: [deviceType] });

  return (
    <div ref={heroRef} className={`hero ${deviceType}-layout`}>
      <div className="bg" />

      <img src="/images/castle.png" alt="Castle" className="castle" />

      {deviceType !== "mobile" && (
        <>
          <img ref={cloudRefs.left1} src="/images/cloudLeft.png" alt="Cloud Left" className="cloudLeft" />
          <img ref={cloudRefs.left2} src="/images/cloud 1.png" alt="Cloud 1" className="cloud1" />
          <img ref={cloudRefs.right1} src="/images/cloud2.png" alt="Cloud 2" className="cloud2" />
          <img ref={cloudRefs.right2} src="/images/cloud_right1.png" alt="Cloud Right" className="cloudRight" />
        </>
      )}

      <div className="text-container price-font">
        <h1 className='welcome'>HPTU Presents</h1>
        <h1 className='name'>Chaitanya 1.0</h1>
      </div>

      <Sidebar />

      {deviceType !== "mobile" && (
        <div className="scroll">
          <FontAwesomeIcon icon={faArrowDown} className="text-4xl text-white drop-shadow-lg" />
          <h4 className="text-white text-xl font-medium drop-shadow-md">scroll down</h4>
        </div>
      )}

      <Social className='social' />
    </div>
  );
}
