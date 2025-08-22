import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function useObjectExpiry(id, expiryTimeSec, callback) {
  const timeout = useRef(0);

  useFrame((_, delta) => {
    timeout.current += delta; 

    if (timeout.current >= expiryTimeSec) {
      callback(id);
    }
  });
}