import { Stars, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { BasicShadowMap, Layers, NoToneMapping } from "three";
import Fireflies from "./Fireflies.jsx";
import Floor from "./Floor.jsx";
import Gun from "./components/gun/Gun.jsx";
import GunController from "./components/gun/GunController.jsx";
import TargetSimple from "./TargetSimple.jsx";
import MartiniHenrySchema from "./guns/MartiniHenry.jsx";
import { Suspense } from "react";

/*
NOTE: GAME UNITS ARE METRES!!!!!
*/

const debug = false;
const layers = new Layers();
layers.enable(1);

export default function App(props) { 
  return (
    <Canvas
      shadows={ {type: BasicShadowMap} } 
      camera={ {fov: 65, far: 3000, near: 0.08, isPerspectiveCamera: true, position:[0, 0, 0], rotation: [0, 0, 0], layers: layers} } 
      gl={ {toneMapping: NoToneMapping, antialias: false, powerPreference:"high-performance"} } 
    >
      {/* <fog attach="fog" args={["rgba(4, 4, 20, 1)", 0, 3000]} /> */}
      <Fireflies position={[0, 1.7, 0]}/> 
      <ambientLight intensity={0.01} />
      <spotLight position={[0, 3, 0]} intensity={3} decay={0.5} castShadow />
      <Suspense>
        <Physics debug={debug} timeStep="vary">
          <TargetSimple position={[0, -1.7 / 2, -200]} />
          {/*<Floor />*/}
          <Gun schema={MartiniHenrySchema}>
            <GunController 
              defaultZoom={1} 
              aimZoom={6}
              ui={props.ui}
            />
          </Gun>
        </Physics>
      </Suspense>
      {/* <Stars radius={500} depth={2000} count={1000} factor={60} saturation={1} fade speed={0.6} /> */}
      {debug && <Stats />}
    </Canvas>
  );
}
