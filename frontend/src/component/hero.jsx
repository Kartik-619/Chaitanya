// hero.jsx
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareInstagram, faFacebook, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './hero.css';
import Sidebar from './navbar';
import Social from './socials';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef();
  const cloudRefs = {
    left1: useRef(),
    left2: useRef(),
    right1: useRef(),
    right2: useRef()
  };

  useGSAP(() => {
    // Determine the total duration of the hero animation.
    // This value, in pixels, is what the user must scroll to finish the animation.
    const heroScrollDuration = 1000; // You can adjust this value

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: `+=${heroScrollDuration}`, 
        scrub: 1.5,
        pin: true,
        onEnterBack: () => gsap.to(".social", { opacity: 1 }), // show social icons on scroll up
        onLeave: () => {
          gsap.to(".social", { opacity: 0 }); // hide social icons on scroll down
          ScrollTrigger.refresh(); // Refresh to ensure the next trigger starts smoothly
        },
      },
    });

    // Clouds and title animations
    tl.to([cloudRefs.left1.current, cloudRefs.left2.current], { xPercent: -120, opacity: 0, stagger: 0.4 }, 0);
    tl.to([cloudRefs.right1.current, cloudRefs.right2.current], { xPercent: 120, opacity: 0, stagger: 0.4 }, 0);
    tl.fromTo([".welcome", ".name"], { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.3 }, "<0.4");
    tl.to(".castle", { scale: 1.1 }, "<");
    tl.to([".scroll"], { opacity: 0 }, "-=0.5");
    tl.to(".social", { opacity: 0 }, "-=0.5");

  }, { scope: heroRef });

  return (
    <div ref={heroRef} className="hero">
      <div className="bg"></div>
      <img src="/images/castle.png" alt="Castle" className="castle" />
      <img ref={cloudRefs.left1} src="/images/cloudLeft.png" alt="Cloud Left" className="cloudLeft" />
      <img ref={cloudRefs.left2} src="/images/cloud 1.png" alt="Cloud 1" className="cloud1" />
      <img ref={cloudRefs.right1} src="/images/cloud2.png" alt="Cloud 2" className="cloud2" />
      <img ref={cloudRefs.right2} src="/images/cloud_right1.png" alt="Cloud Right" className="cloudRight" />

      <div className="price-font absolute flex flex-col items-center gap-4 top-40 left-1/2 -translate-x-1/2 text-4xl font-bold text-white">
        <h1 className='welcome '>HPTU Presents</h1>
        <h1 className='name '>Chaitanya 1.0</h1>
      </div>
      <Sidebar />
      <div className="scroll fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
        <FontAwesomeIcon icon={faArrowDown} className="text-4xl text-white drop-shadow-lg" />
        <h4 className="text-white text-xl font-medium drop-shadow-md">scroll down</h4>
      </div>
      <Social className='social'/>
    </div>
  );
}