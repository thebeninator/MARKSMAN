import { useEffect, useState } from "react";

export default function useAdsController(pointerLocked, isReloading) {
  const [isAiming, setIsAiming] = useState(false);

  useEffect(() => {
    if (isReloading) {
      setIsAiming(false);
    }

    const ads = (e) => {
      if (!isReloading && e.button === 2 && pointerLocked.current) {
        setIsAiming(!isAiming);
      }
    }

    window.addEventListener("mousedown", ads);
    return () => window.removeEventListener("mousedown", ads);
  }, [isAiming, isReloading]);
  
  return {isAiming, setIsAiming};
}