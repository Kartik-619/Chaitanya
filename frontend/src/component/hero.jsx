import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './hero.css';
import Loader from './loader/loader'; // Import the loader

const getOptimizedImageUrl = (publicId) => {
  return `https://res.cloudinary.com/dpe1pmwsv/image/upload/${publicId}`;
};

gsap.registerPlugin(ScrollTrigger);

const setupDesktopAnimations = (heroRef, cloudRefs) => {
  // Kill any existing animations
  gsap.killTweensOf([
    cloudRefs.left1.current, 
    cloudRefs.left2.current, 
    cloudRefs.right1.current, 
    cloudRefs.right2.current,
    ".welcome",
    ".name", 
    ".castle",
    ".scroll"
  ]);

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" }
  });

  // Initial setup - hide elements that will animate in
  gsap.set([".welcome", ".name"], { opacity: 0, y: 50 });
  gsap.set(".scroll", { opacity: 1 });

  // Main animation sequence
  tl.to(".scroll", { opacity: 0, duration: 0.5 }, 0)
    .fromTo(".welcome", 
      { opacity: 0.3, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.5, stagger: 0.1, delay: 0.2 }, 
      0.5
    )
    .to(".castle", { scale: 1.05, duration: 1.8, delay: 0.5 }, 0.5)
    .to([cloudRefs.left1.current, cloudRefs.left2.current], {
      xPercent: -100,
      opacity: 0,
      duration: 2,
   
    }, 1)
    .fromTo(".name", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.7, delay: 0.2 }, 
      0.5
    )
    .to([cloudRefs.right1.current, cloudRefs.right2.current], {
      xPercent: 100,
      opacity: 0,
      duration: 2,
      
      delay: 0.21
    }, 1);

  return tl;
};

const setupStaticView = (cloudRefs) => {
  // Kill all animations and reset elements to visible state
  gsap.killTweensOf([
    ".welcome", ".name", ".scroll", ".castle",
    cloudRefs.left1.current, cloudRefs.left2.current,
    cloudRefs.right1.current, cloudRefs.right2.current
  ]);
  
  // Reset everything to default state but keep clouds visible for animation
  gsap.set([".welcome", ".name", ".scroll", ".castle"], { 
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1
  });

  // Reset clouds to original position but keep them visible
  gsap.set([cloudRefs.left1.current, cloudRefs.left2.current, cloudRefs.right1.current, cloudRefs.right2.current], {
    opacity: 1,
    xPercent: 0,
    x: 0
  });

  // Create timeline for static devices too
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" }
  });

  // Initial setup
  gsap.set([".welcome", ".name"], { opacity: 0, y: 50 });
  gsap.set(".scroll", { opacity: 1 });

  // Same animation sequence for all devices
  tl.to(".scroll", { opacity: 0, duration: 0.5 }, 0)
    .fromTo(".welcome", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, delay: 1 }, 
      0.5
    )
    .to(".castle", { scale: 1.05, duration: 1.5, delay: 2 }, 0.5)
    .to([cloudRefs.left1.current, cloudRefs.left2.current], {
      xPercent: -100,
      opacity: 0,
      duration: 2,
      delay: 2
    }, 1)
    .fromTo(".name", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1,  delay: 1.5 }, 
      0.5
    )
    .to([cloudRefs.right1.current, cloudRefs.right2.current], {
      xPercent: 100,
      opacity: 0,
      duration: 2,
      delay: 0.8
    }, 1);

  return tl;
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
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const animationTimeline = useRef();

  // Image loading function
  const preloadImages = () => {
    const imageUrls = [
      getOptimizedImageUrl('castle_rqfln4'),
      getOptimizedImageUrl('cloudLeft_bsofo7'),
      getOptimizedImageUrl('cloud_1_l2qd7g'),
      getOptimizedImageUrl('cloud2_othzfm'),
      getOptimizedImageUrl('cloud_right1_qibfp4')
    ];

    const promises = imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    return Promise.all(promises);
  };

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width > 2085) {
        setDeviceType("desktop");
      } else {
        setDeviceType("static");
      }
    };
   
    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Preload images and then hide loader
    preloadImages()
      .then(() => {
        // Add a small delay for smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
        // Still hide loader after a timeout even if some images fail
        setTimeout(() => setIsLoading(false), 3000);
      });

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useGSAP(() => {
    // Don't start animations if still loading
    if (isLoading) return;

    // Kill existing timeline
    if (animationTimeline.current) {
      animationTimeline.current.kill();
    }

    // Apply the same timeline animation to ALL devices
    if (deviceType === "desktop") {
      animationTimeline.current = setupDesktopAnimations(heroRef, cloudRefs);
    } else {
      animationTimeline.current = setupStaticView(cloudRefs);
    }
  }, { scope: heroRef, dependencies: [deviceType, isLoading] });

  // Show loader while loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div ref={heroRef} className={`hero ${deviceType}-layout`}>
      <div className="bg" />

      <img src={getOptimizedImageUrl('castle_rqfln4')} alt="Castle" className="castle" />

      {/* Show clouds on ALL devices now since animation works everywhere */}
      <>
        <img ref={cloudRefs.left1} src={getOptimizedImageUrl('cloudLeft_bsofo7')} alt="Cloud Left" className="cloudLeft" />
        <img ref={cloudRefs.left2} src={getOptimizedImageUrl('cloud_1_l2qd7g')} alt="Cloud 1" className="cloud1" />
        <img ref={cloudRefs.right1} src={getOptimizedImageUrl('cloud2_othzfm')} alt="Cloud 2" className="cloud2" />
        <img ref={cloudRefs.right2} src={getOptimizedImageUrl('cloud_right1_qibfp4')} alt="Cloud Right" className="cloudRight" />
      </>

      <div className="text-container price-font">
        <h1 className='welcome'>HPTU Presents</h1>
        <h1 className='name'>Chaitanya 1.0</h1>
      </div>

      {/* Show scroll indicator on ALL devices */}
      <div className="scroll">
        <FontAwesomeIcon icon={faArrowDown} className="text-4xl text-white drop-shadow-lg" />
        <h4 className="text-white text-xl font-medium drop-shadow-md">scroll down</h4>
      </div>
    </div>
  );
}