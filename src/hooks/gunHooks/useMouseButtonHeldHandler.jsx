import { useState, useEffect } from "react";

export default function useMouseButtonHeldHandler() {
  const [holdingRightClick, setHoldingRightClick] = useState(false);
  const [holdingLeftClick, setHoldingLeftClick] = useState(false);

  useEffect(() => {
    const buttonHeld = (e) => {
      if (e.button === 2) setHoldingRightClick(true);
      if (e.button === 0) setHoldingLeftClick(true);
    };

    const buttonReleased = (e) => {
      if (e.button === 2) setHoldingRightClick(false);
      if (e.button === 0) setHoldingLeftClick(false);
    };    

    window.addEventListener("mousedown", buttonHeld); 
    window.addEventListener("mouseup", buttonReleased); 
    return () => {
      window.removeEventListener("mousedown", buttonHeld);
      window.removeEventListener("mousedown", buttonReleased);
    }
  }, [holdingLeftClick, holdingRightClick]);

  return { holdingLeftClick, holdingRightClick };
}