// src/components/Typewriter.jsx
import { useState, useEffect } from 'react';

export default function Typewriter({ 
  text = "", 
  speed = 150,           // typing speed
  backSpeed = 75,        // backspacing speed
  delay = 2500,          // time to wait before deleting
  className = "" 
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;

    if (!isDeleting && index < text.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, index + 1));
        setIndex(prev => prev + 1);
      }, speed);
    } else if (isDeleting && index > 0) {
      // Deleting backward
      timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, index - 1));
        setIndex(prev => prev - 1);
      }, backSpeed);
    } else if (!isDeleting && index === text.length) {
      // Finished typing → wait, then start deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delay);
    } else if (isDeleting && index === 0) {
      // Finished deleting → reset and start over
      setIsDeleting(false);
      setIndex(0);
      // Optional: slight pause before retyping
      timeout = setTimeout(() => {}, 500);
    }

    return () => clearTimeout(timeout);
  }, [index, isDeleting, text, speed, backSpeed, delay]);

  return (
    <h1
      className={`${className} inline-block`}
      style={{
        letterSpacing: "1px",
        textShadow: "0 0 4px black",
      }}
    >
      {displayedText}
      <span className="animate-pulse ml-1">|</span>
    </h1>
  );
}