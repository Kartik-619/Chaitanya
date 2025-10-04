import './hero.css';
import Sidebar from "./navbar";
import Typewriter from './typewriter';
import { useRef } from 'react';




export default function Hero() {
  const heroRef = useRef();
  const cloud1Ref = useRef();
  const cloud2Ref = useRef();
  const castleRef = useRef();

  

  return (
    <>
      {/* Hero Section */}
      <div ref={heroRef} className="hero relative w-full min-h-screen overflow-hidden">
        <div className="bg"></div>
      
        <img ref={castleRef} dataspeed={0.2} src="/images/castle2.png" alt="Castle" className="castle" />
        <img ref={cloud1Ref}  dataspeed={0.9} src="C:\Users\anshi\OneDrive\Desktop\cloud.png" alt="Cloud 1" className="cloud1" />
        <img ref={cloud2Ref}  dataspeed={0.2} src="/images/cloud2.png" alt="Cloud 2" className="cloud2" />
        
        <Sidebar />
        
        <div className="relative z-10 flex h-screen text-white">
          <Typewriter
            className="price-font absolute top-10 left-1/2 -translate-x-1/2 text-9xl font-bold"
            text="Welcome"
            speed={150}
          />
        </div>
      </div>


      <div style={{ height: '150vh', backgroundColor: '#0a0a0a', position: 'relative', zIndex: 0 }}></div>
    </>
  );
}