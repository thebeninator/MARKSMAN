import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { BasicShadowMap, Layers } from "three";
import Floor from "./Floor.jsx";
import TargetSimple from "./TargetSimple.jsx";
import GunController from "./GunController.jsx";

/*
NOTE: GAME UNITS ARE METRES!!!!!
*/

const layers = new Layers();
layers.enable(1);

export default function App(props) { 
  return (
    <Canvas
      flat
      shadows={ {type: BasicShadowMap } } 
      camera={ {fov: 65, far: 5000, isPerspectiveCamera: true, position:[0, 0, 0], rotation: [0, 0, 0], layers: layers} } 
      gl={ {antialias: false} } 
      dpr={[0.5, 1]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight lookAt={[0, -1.7 / 2, -200]} position={[0, 1, -200]} intensity={2} decay={0.7} castShadow />
      <pointLight position={[0, 50, 50]} intensity={2} decay={0.1} castShadow />
      <Physics colliders={false} timeStep="vary">
        <Floor />
        <TargetSimple position={[0, -1.7 / 2, -200]} />
        <GunController 
          defaultZoom={1} 
          aimZoom={6}
          ui={props.ui}
        />
      </Physics>
      <Stats />
    </Canvas>
  );
}
