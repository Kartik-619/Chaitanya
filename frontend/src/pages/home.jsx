import { useRef, useState, useEffect } from 'react';
import Hero from '../component/hero';
import About from '../component/aboutUs';
import './home.css';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Social from '../component/socials';
import Sidebar from '../component/navbar';
import Loader from '../component/loader/loader';
import AboutNew from '../component/AboutNew';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const aboutRef = useRef();
  const [isLoading, setIsLoading] = useState(true);

  useGSAP(() => {
    if (isLoading) return;

    // Simple animations for both sections
    gsap.fromTo('.hero-section', 
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 1,
      }
    );

    gsap.fromTo('.about-section1', 
      { opacity: 0, y: 100 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.5,
        scrollTrigger: {
          trigger: '.about-section1',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {/* Hero Section - Comes FIRST in the DOM */}
      <div className="hero-section">
        <Hero />
      </div>
      
      
      <Social/>
      
      {/* About Section - Comes AFTER Hero in the DOM */}
      <div className="about-container">
        <AboutNew ref={aboutRef} />
      </div>
    </>
  );
}