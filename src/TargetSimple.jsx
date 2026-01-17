import { Edges, Sparkles, SpotLight } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useState } from "react";
import { Object3D } from "three";

// TODO: put lighting behind target 

export default function TargetSimple(props) {
  const [target] = useState(() => new Object3D())

  return (
    <group position={props.position}>
      <RigidBody 
        rotation={[0, Math.PI/4, 0]} 
        name="target" 
        type="fixed"
      >
        <mesh castShadow>
          <boxGeometry args={[1.7, 1.7, 1.7]} />
          <meshBasicMaterial color="white" /> 
          <Edges color="black" linewidth={2} renderOrder={1}/>
        </mesh>
      </RigidBody>

      <Sparkles position={[0, 2.5, 0]} color="white" count={10} scale={5} size={30} speed={2} />

      <SpotLight
        position={[0, 15, 0]}
        target={target}
        radiusTop={0.4}
        radiusBottom={40}
        distance={80}
        angle={0.45}
        attenuation={20}
        anglePower={0}
        intensity={5}
        opacity={0.5}
        decay={0}
      />
      <primitive object={target} position={[0, -1, 0]} />
    </group>
  );
}