import { Outlines, useGLTF } from "@react-three/drei";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import { memo, useContext } from "react";
import GunContext from "./gun/GunContext";

const Casing = memo(function Casing(props) {
  // TODO: use useObjectExpiry
  const gun = useContext(GunContext);
  const { nodes } = useGLTF(gun.schema.casing.url);

  return (
    <RigidBody 
      position={props.position}
      quaternion={props.rotation}
      scale={0.1}
      linearVelocity={props.velocity}
      angularVelocity={props.angVelocity}
      collisionGroups={interactionGroups(0, [0])}
    >
      <mesh geometry={nodes[gun.schema.casing.root].geometry}>
        <meshStandardMaterial color={"rgb(232, 232, 232)"}/>
        <Outlines color="black" thickness={1.5} angle={0} />
      </mesh>
    </RigidBody>
  );
});

export default Casing;