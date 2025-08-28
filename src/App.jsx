import { Sparkles, Stars, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { BasicShadowMap, Layers, NoToneMapping } from "three";
import Floor from "./Floor.jsx";
import Gun from "./Gun.jsx";
import GunController from "./GunController.jsx";
import TargetSimple from "./TargetSimple.jsx";
import Fireflies from "./Fireflies.jsx";

/*
NOTE: GAME UNITS ARE METRES!!!!!
*/

const debug = true;
const layers = new Layers();
layers.enable(1);

export default function App(props) { 
  return (
    <Canvas
      shadows={ {type: BasicShadowMap} } 
      camera={ {fov: 65, far: 5000, near: 0.08, isPerspectiveCamera: true, position:[0, 0, 0], rotation: [0, 0, 0], layers: layers} } 
      gl={ {toneMapping: NoToneMapping, antialias: false, powerPreference:"high-performance"} } 
    >
      <Fireflies position={[0, 1.7, 0]}/> 
      <ambientLight intensity={0.01} />
      <spotLight position={[0, 3, 0]} intensity={3} decay={0.5} castShadow />
      <Physics debug={debug} timeStep="vary">
        <TargetSimple position={[0, -1.7 / 2, -200]} />
        <Floor />
        <Gun>
          <GunController 
            defaultZoom={1} 
            aimZoom={6}
            ui={props.ui}
          />
        </Gun>
      </Physics>
      <Stars radius={500} depth={2000} count={5000} factor={60} saturation={1} fade speed={0.6} />
      {debug && <Stats />}
    </Canvas>
  );
}
