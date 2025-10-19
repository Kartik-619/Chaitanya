import { useRef, useState, useEffect } from 'react';
import Hero from '../component/hero';
import About from '../component/aboutUs';
import './home.css';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Social from '../component/socials';
import Sidebar from '../component/navbar';
import Loader from '../component/loader/loader'; // Import loader

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const horizontalRef = useRef();
  const [isLoading, setIsLoading] = useState(true);

  useGSAP(() => {
    // Don't setup scroll trigger if still loading
    if (isLoading) return;

    const sections = gsap.utils.toArray('.h-section');

    const scrollTween = gsap.to(sections, {
      xPercent: 560 * (sections.length - 1),
      ease: 'none',
      stagger: 2,
      delay: 1,
      scrollTrigger: {
        trigger: horizontalRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        start: 'top top',
        end: () =>
          '+=' + (horizontalRef.current.scrollWidth - window.innerWidth),
      },
    });

    ScrollTrigger.refresh();
    return () => scrollTween.kill();
  }, [isLoading]);

  // Let Hero component handle the loading, but add a fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // Maximum loading time fallback

    return () => clearTimeout(timer);
  }, []);

  // Show loader while loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {/* Normal vertical scroll section */}
      <div className="hero-section">
        <Hero />
      </div>
      <Sidebar/>
      <Social/>
      {/* Horizontal scroll section */}
      <div ref={horizontalRef} className="horizontal-wrapper">
        <section className="h-section"><About /></section>
      </div>
    </>
  );
}