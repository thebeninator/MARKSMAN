import { Edges } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

export default function Floor() {
  return (
    <RigidBody key="d" type="fixed" name="floor" colliders={false}>
      <mesh receiveShadow position={[0, -1.7, 0]} rotation={[-Math.PI / 2.0, 0, 0]}>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color="rgba(128, 128, 128, 1)" />
        <Edges color="black" lineWidth={3}/>
      </mesh>
      {/* separate collider since objects would sometimes phase right through the plane geom */}
      <CuboidCollider args={[5000, 2, 5000]} position={[0, -3.7, 0]} />
    </RigidBody>
  );
}