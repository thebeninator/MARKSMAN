import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

// RigidBody components will not automatically follow its parent
export default function useColliderFollower(collider, world, local) {
  useFrame(() => {
    const pos = new Vector3();
    local.current.getWorldPosition(pos);
    const rot = world.current.quaternion.clone().multiply(local.current.quaternion);

    collider.current.setTranslation(pos);
    collider.current.setRotation(rot);
  });
}