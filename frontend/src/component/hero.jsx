import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './hero.css';
import Loader from './loader/loader';
import NavHero from './navHero/navHero';

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
    ".scroll",
    ".reg_button"
  ]);

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" }
  });

  // Initial setup - hide elements that will animate in
  gsap.set([".welcome", ".name", ".reg_button"], { opacity: 0, y: 50 });
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
    // Name appears with the clouds animation
    .fromTo(".name", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.7 }, 
      1.2
    )
    .to([cloudRefs.right1.current, cloudRefs.right2.current], {
      xPercent: 100,
      opacity: 0,
      duration: 2,
    }, 1)
    // Register Button appears AFTER clouds start disappearing (midway through cloud animation)
    .fromTo(".reg_button", 
      { opacity: 0, y: 50 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.5,
        onComplete: () => {
          // Ensure button is clickable after animation
          document.querySelector('.reg_button').style.pointerEvents = 'auto';
        }
      }, 
      1.8
    );

  return tl;
};

const setupStaticView = (cloudRefs) => {
  // Kill all animations and reset elements to visible state
  gsap.killTweensOf([
    ".welcome", ".name", ".scroll", ".castle", ".reg_button",
    cloudRefs.left1.current, cloudRefs.left2.current,
    cloudRefs.right1.current, cloudRefs.right2.current
  ]);
  
  // Reset everything to default state but keep clouds visible for animation
  gsap.set([".welcome", ".name", ".scroll", ".castle", ".reg_button"], { 
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

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" }
  });

  gsap.set(".reg_button", { scale: 1 });
  
  // Initial setup
  gsap.set([".welcome", ".name", ".reg_button"], { opacity: 0, y: 50 });
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
    // Name appears with the clouds animation
    .fromTo(".name", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1 }, 
      2.5
    )
    .to([cloudRefs.right1.current, cloudRefs.right2.current], {
      xPercent: 100,
      opacity: 0,
      duration: 2,
      delay: 0.8
    }, 1)
    // Register Button appears AFTER clouds start disappearing
    .fromTo(".reg_button", 
      { opacity: 0, y: 50 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2,
        onComplete: () => {
          // Ensure button is clickable after animation
          document.querySelector('.reg_button').style.pointerEvents = 'auto';
        }
      }
    );

  return tl;
};

// Simple button glow animation using class name
const setupButtonGlow = () => {
  // Kill any existing button animations
  gsap.killTweensOf(".reg_button");
  
  const tl = gsap.timeline({ 
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Use box-shadow instead of scale for glow effect to avoid click issues
  tl.to(".reg_button", {
    boxShadow: "0 0 20px 8px rgba(34, 197, 94, 0.6)",
    duration: 1.5,
    ease: "sine.inOut"
  })
  .to(".reg_button", {
    boxShadow: "0 0 30px 12px rgba(34, 197, 94, 0.8)",
    duration: 1,
    ease: "sine.inOut"
  })
  .to(".reg_button", {
    boxShadow: "0 0 15px 5px rgba(34, 197, 94, 0.4)",
    duration: 1.5,
    ease: "sine.inOut"
  });

  return tl;
};

export default function Hero() {
  const heroRef = useRef();
  const buttonRef = useRef(); // Add button ref back for direct access
  const cloudRefs = {
    left1: useRef(),
    left2: useRef(),
    right1: useRef(),
    right2: useRef()
  };
  
  const handleRegister = () => {
    console.log('Register button clicked!'); // Debug log
    window.open('https://chaitanya-subdomain.vercel.app/', '_blank', 'noopener,noreferrer');
  };

  const [deviceType, setDeviceType] = useState("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const animationTimeline = useRef();
  const buttonAnimationTimeline = useRef();

  const preloadImages = () => {
    const imageUrls = [
      getOptimizedImageUrl('castle_c7d5oc'),
      getOptimizedImageUrl('cloudLeft_qxcpnl'),
      getOptimizedImageUrl('cloud_1_ny9xmx'),
      getOptimizedImageUrl('cloud2_k7nb4c'),
      getOptimizedImageUrl('cloud_right1_lb7hcg')
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

    preloadImages()
      .then(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
        setTimeout(() => setIsLoading(false), 3000);
      });

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useGSAP(() => {
    if (isLoading) return;

    if (animationTimeline.current) {
      animationTimeline.current.kill();
    }

    if (deviceType === "desktop") {
      animationTimeline.current = setupDesktopAnimations(heroRef, cloudRefs);
    } else {
      animationTimeline.current = setupStaticView(cloudRefs);
    }

    // Start button glow animation after main animations
    setTimeout(() => {
      if (buttonAnimationTimeline.current) {
        buttonAnimationTimeline.current.kill();
      }
      buttonAnimationTimeline.current = setupButtonGlow();
    }, 3000);
  }, { scope: heroRef, dependencies: [deviceType, isLoading] });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div ref={heroRef} className={`hero ${deviceType}-layout`}>
      <div className="bg" />

      <img src={getOptimizedImageUrl('castle_c7d5oc')} alt="Castle" className="castle" />

      {/* Show clouds on ALL devices now since animation works everywhere */}
      <>
        <img ref={cloudRefs.left1} src={getOptimizedImageUrl('cloudLeft_qxcpnl')} alt="Cloud Left" className="cloudLeft" />
        <img ref={cloudRefs.left2} src={getOptimizedImageUrl('cloud_1_ny9xmx')} alt="Cloud 1" className="cloud1" />
        <img ref={cloudRefs.right1} src={getOptimizedImageUrl('cloud2_k7nb4c')} alt="Cloud 2" className="cloud2" />
        <img ref={cloudRefs.right2} src={getOptimizedImageUrl('cloud_right1_lb7hcg')} alt="Cloud Right" className="cloudRight" />
      </>

      <div className="text-container price-font">
        <h1 className='welcome'>HPTU Presents</h1>
        <h1 className='name'>Chaitanya 1.0</h1>
      </div>
    
      {/* Button with ref and inline styles to ensure clickability */}
     <NavHero/>
    
      {/* Show scroll indicator on ALL devices */}
      <div className="scroll">
        <FontAwesomeIcon icon={faArrowDown} className="text-4xl text-white drop-shadow-lg" />
        <h4 className="text-white text-xl font-medium drop-shadow-md">scroll down</h4>
      </div>
    </div>
  );
}