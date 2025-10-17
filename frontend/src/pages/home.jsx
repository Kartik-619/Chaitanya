import { useRef } from 'react';
import Hero from '../component/hero';
import About from '../component/aboutUs'; // Fixed import name
import './home.css';

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const horizontalRef = useRef();

  useGSAP(() => {
    const sections = gsap.utils.toArray('.h-section');

    const scrollTween = gsap.to(sections, {
      xPercent: -150 * (sections.length - 1),
      ease: 'none',
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
  }, []);

  return (
    <>
      {/* Normal vertical scroll section */}
      <div className="hero-section">
        <Hero />
      </div>

      {/* Horizontal scroll section */}
      <div ref={horizontalRef} className="horizontal-wrapper">
        <section className="h-section"><About /></section> {/* Fixed component name */}
      </div>
    </>
  );
}