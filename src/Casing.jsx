import { Outlines, useGLTF } from "@react-three/drei";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import { memo } from "react";
import { radToDeg } from "three/src/math/MathUtils.js";
import martiniHenryCasingUrl from "./assets/martini_henry_casing.glb";

// need to memoize otherwise ALL casings get re-rendered
// and we end up with funky rapier behaviour 
const Casing = memo(function Casing(props) {
  // TODO: use useObjectExpiry
  const { nodes } = useGLTF(martiniHenryCasingUrl);

  return (
    <RigidBody 
      position={props.position}
      scale={0.1}
      linearVelocity={props.velocity}
      angularVelocity={props.angVelocity}
      collisionGroups={interactionGroups(0, [0])}
    >
      <mesh geometry={nodes["martini_henry_casing"].geometry}>
        <meshStandardMaterial color={"rgb(232, 232, 232)"}/>
        <Outlines color="black" thickness={1.5} angle={0} />
      </mesh>
    </RigidBody>
  );
});

export default Casing;

useGLTF.preload(martiniHenryCasingUrl);