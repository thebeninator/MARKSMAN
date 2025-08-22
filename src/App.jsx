import { Stars, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { BasicShadowMap, Layers } from "three";
import Floor from "./Floor.jsx";
import TargetSimple from "./TargetSimple.jsx";
import GunController from "./GunController.jsx";

/*
NOTE: GAME UNITS ARE METRES!!!!!
*/

const stats = false;
const layers = new Layers();
layers.enable(1);

export default function App(props) { 
  return (
    <Canvas
      flat
      shadows={ {type: BasicShadowMap} } 
      camera={ {fov: 65, far: 5000, near: 0.08, isPerspectiveCamera: true, position:[0, 0, 0], rotation: [0, 0, 0], layers: layers} } 
      gl={ {antialias: false, powerPreference:"high-performance"} } 
    >
      <ambientLight intensity={0.05} />
      <spotLight position={[0, 3, 0]} intensity={3} decay={0.5} castShadow />
      <Physics timeStep="vary">
        <Floor />
        <TargetSimple position={[0, -1.7 / 2, -200]} />
        <GunController 
          defaultZoom={1} 
          aimZoom={6}
          ui={props.ui}
        />
      </Physics>
      <Stars radius={500} depth={2000} count={5000} factor={60} saturation={1} fade speed={2.5} />
      {stats && <Stats />}
    </Canvas>
  );
}
