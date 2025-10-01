import './hero.css';
import Sidebar from "./navbar";
import { useState } from 'react';
export default function Hero() {
    const [offset,setOffest]=useState(0);
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background */}
      <div className="bg"></div>

      {/* Sidebar */}
      <Sidebar />
    
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-screen text-white">
        <h1 className="trade-font self-center items-center top-5 text-4xl font-bold">Welcome!</h1>
      </div>
    </div>
  );
}
