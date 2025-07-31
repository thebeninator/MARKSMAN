import { Edges } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Floor() {
  return (
    <RigidBody type="fixed" name="floor" colliders="cuboid">
      <mesh receiveShadow position={[0, -1.7, 0]} rotation={[-Math.PI / 2.0, 0, 0]}>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color="rgb(232, 232, 232)" />
        <Edges color="black" lineWidth={3}/>
      </mesh>
    </RigidBody>
  );
}