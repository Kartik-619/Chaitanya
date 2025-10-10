import { useState, useEffect } from "react";

export default function CursorPointer() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cursor_XY = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", cursor_XY);

    return () => {
      window.removeEventListener("mousemove", cursor_XY);
    };
  }, []);
useEffect(()=>{
    {console.log(`X: ${cursorPosition.x}, Y: ${cursorPosition.y}`)};
})
 

  return null;
      
 
  ;
}
