import { Edges } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";

// TODO: put lighting behind target 

export default function TargetSimple(props) {

  return (
    <RigidBody 
      position={props.position} 
      rotation={[0, Math.PI/4, 0]} 
      name="target" 
      colliders="cuboid" 
      type="fixed"
    >
      <mesh castShadow>
        <boxGeometry args={[1.7, 1.7, 1.7]} />
        <meshBasicMaterial color="white" /> 
        <Edges color="black" linewidth={2} renderOrder={1}/>
      </mesh>  
    </RigidBody>
  );
}