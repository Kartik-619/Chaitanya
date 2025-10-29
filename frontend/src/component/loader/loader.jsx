import './loader.css';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Typewriter from '../typewriter';

const Loader = () => {
  const iconRef = useRef(null);

  useEffect(() => {
    const rotateIcon = () => {
      gsap.to(iconRef.current, {
        rotation: "+=360", // Rotate 360 degrees from current position
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          // Wait 4 seconds before next rotation
          setTimeout(rotateIcon, 4000);
        }
      });
    };

    // Start the first rotation after 2 seconds
    const initialDelay = setTimeout(rotateIcon, 2000);

    // Clean up
    return () => {
      clearTimeout(initialDelay);
      gsap.killTweensOf(iconRef.current);
    };
  }, []);

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div ref={iconRef} className="icon-loader"></div>
        <Typewriter className="loader-text" text='Chaitanya 1.0'></Typewriter>
        
      
      </div>
    </div>
  );
};

export default Loader;