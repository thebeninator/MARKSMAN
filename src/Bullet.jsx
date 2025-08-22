import { Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, vec3 } from "@react-three/rapier";
import { useRef } from "react";
import useObjectExpiry from "./hooks/useObjectExpiry";
import { radToDeg } from "three/src/math/MathUtils.js";

export default function Bullet(props) {
  const ref = useRef();
  const muzzleVelocity = useRef(props.muzzleVelocityVector.length());

  useObjectExpiry(props.id, 15, props.destroyBullet);

  useFrame((_, delta) => {
    if (ref.current === null) { return } 
    
    const velocity = ref.current.linvel();
    const vec = vec3({x: velocity.x, y: velocity.y, z: velocity.z});
    muzzleVelocity.current -= 1 * delta;
    if (muzzleVelocity.current <= 0) {
      muzzleVelocity.current = 1;
    }
    vec.normalize().multiplyScalar(muzzleVelocity.current);
    vec.setY(velocity.y);
    ref.current.setLinvel(vec);
  });

  return (
    <RigidBody 
      ref={ref} 
      colliders="ball" 
      onCollisionEnter={ manifold => { props.onBulletHit(manifold, props.id) } }
      rotation={props.rotation} position={props.position}
      linearVelocity={props.muzzleVelocityVector}
      scale={0.05}
    >
      <mesh castShadow>
        <sphereGeometry />
        <meshBasicMaterial color="white"/>
        <Outlines color="black" thickness={1.5} />
      </mesh>
    </RigidBody>
  );
}