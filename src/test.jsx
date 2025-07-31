import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

export default function Test() {
  const [xPos, setxPos] = useState(0);
  
  useFrame((state, delta, frame) => {
    setxPos((curr) => curr + 1 * delta);
  })
  
  return (
    <mesh castShadow position={[xPos, 1, 0]}>
      <boxGeometry />
      <meshStandardMaterial color="red"/>
    </mesh>
  );
}
