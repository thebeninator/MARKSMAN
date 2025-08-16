import { Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, vec3 } from "@react-three/rapier";
import { useRef } from "react";

export default function Bullet(props) {
  const ref = useRef();
  const muzzleVelocity = useRef(props.muzzleVelocityVector.length());
  const timeout = useRef(0); 

  useFrame((state, delta, frame) => {
    if (ref.current === null) { return } 

    timeout.current += delta; 

    if (timeout.current >= 15) {
      props.destroyBullet(props.id);
    }
    
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
    >
      <mesh scale={0.15} castShadow>
        <sphereGeometry />
        <meshBasicMaterial color="white"/>
        <Outlines color="black" thickness={0.2} screenspace/>
      </mesh>
    </RigidBody>
  );
}