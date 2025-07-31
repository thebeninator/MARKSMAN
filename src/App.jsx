import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { BasicShadowMap } from "three";
import Floor from "./Floor.jsx";
import TargetSimple from "./TargetSimple.jsx";
import GunController from "./GunController.jsx";

/*
NOTE: GAME UNITS ARE METRES!!!!!
*/

export default function App() { 
  return (
    <Canvas
      flat
      shadows={ {type: BasicShadowMap } } 
      camera={ {fov: 65, far: 5000, isPerspectiveCamera: true, position:[0, 0, 0], rotation: [0, 0, 0]} } 
      gl={ {antialias: false} } 
    >
      <ambientLight intensity={0.5} />
      <directionalLight lookAt={[0, -1.7 / 2, -500]} position={[0, 1.7, -500]} intensity={2} decay={0.7} castShadow />
      <pointLight position={[0, 50, 50]} intensity={2} decay={0.1} castShadow />
      <Suspense>
        <Physics colliders={false} timeStep="vary">
          <Floor />
          <TargetSimple position={[0, -1.7 / 2, -500]} />
          <GunController 
            defaultZoom={1} 
            aimZoom={6} 
          />
          <Stats />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
