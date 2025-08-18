import { useEffect, useState } from "react";

export default function useAdsController(pointerLocked, isReloading) {
  const [isAiming, setIsAiming] = useState(false);
  const [wasAiming, setWasAiming] = useState(false);

  useEffect(() => {
    if (isReloading) { 
      if (isAiming) setWasAiming(true);
      setIsAiming(false); 
    } else if (wasAiming) {
      setIsAiming(true);
    }

    const ads = (e) => {
      if (e.button !== 2) return;
      if (isReloading) return; 
      if (!pointerLocked.current) return;

      const toggle = !isAiming;
      setWasAiming(toggle); 
      setIsAiming(toggle);
    }

    window.addEventListener("mousedown", ads);
    return () => window.removeEventListener("mousedown", ads);
  }, [pointerLocked, isAiming, wasAiming, isReloading]);
  
  return { isAiming, setIsAiming };
}