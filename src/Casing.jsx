import { Outlines, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { radToDeg } from "three/src/math/MathUtils.js";
import martiniHenryCasingUrl from "./assets/martini_henry_casing.glb";

export default function Casing(props) {
  const { nodes } = useGLTF(martiniHenryCasingUrl);

  return (
    <RigidBody 
      position={props.position}
      scale={0.1}
      linearVelocity={props.velocity}
      angularVelocity={props.angVelocity}
    >
      <mesh geometry={nodes["martini_henry_casing"].geometry}>
        <meshStandardMaterial color={"rgb(232, 232, 232)"}/>
        <Outlines color="black" thickness={1.5} angle={radToDeg(180)} />
      </mesh>
    </RigidBody>
  );
}

useGLTF.preload(martiniHenryCasingUrl);