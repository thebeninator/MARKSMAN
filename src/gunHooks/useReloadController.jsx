import { useEffect, useState } from "react";

export default function useReloadController() {
  const [isReloading, setReloading] = useState(false);

  useEffect(() => {
    const mouseMove = (e) => {
      if (!isReloading) return;
      console.log(e.movementY);
    }

    window.addEventListener("mousemove", mouseMove); 
    return () => window.removeEventListener("mousemove", mouseMove);
  }, [isReloading]);

  useEffect(() => {
    const keydown = (e) => {
      if (e.code === "KeyR") {
        setReloading(true);
      }
    }

    const keyup = (e) => {
      if (e.code === "KeyR") {
        setReloading(false);
      }
    }

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("keyup", keyup)
    };  
  }, [isReloading]);     


  return {isReloading, setReloading};
}