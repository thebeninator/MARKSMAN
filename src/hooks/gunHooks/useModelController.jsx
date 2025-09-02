import { useFrame } from "@react-three/fiber";
import * as easing from "maath/easing";
import { use, useEffect } from "react";
import GunContext from "../../components/gun/GunContext";

export default function useModelController(props) {
  const gun = use(GunContext);
  const positions = gun.schema.model.positions;
  const rotations = gun.schema.model.rotations;

  useEffect(() => {
    if (!props.justShot) return; 
    gun.model.current.quaternion.multiply(rotations.recoil);
    gun.modelLocal.current.position.setZ(gun.modelLocal.current.position.z + 0.30);
    gun.modelLocal.current.position.setY(gun.modelLocal.current.position.y + 0.01);
  }, [props.justShot]);

  useFrame((state, delta) => {
    const desiredRotQ = state.camera.quaternion.clone();
    easing.dampQ(gun.model.current.quaternion, desiredRotQ, 0.25, delta, 1, easing.exp, 0.0001);
    gun.model.current.position.copy(state.camera.position);

    const desiredPos = props.reloadOverrides.current.position === null || !props.isReloading ? 
      (props.isAiming ? positions.ads : positions.default) : positions[props.reloadOverrides.current.position];

    const desiredRot = props.reloadOverrides.current.rotation === null || !props.isReloading ? 
      rotations.default : rotations[props.reloadOverrides.current.rotation];

    easing.damp3(gun.modelLocal.current.position, desiredPos, 0.25, delta);
    easing.dampQ(gun.modelLocal.current.quaternion, desiredRot, 0.25, delta, 1, easing.exp, 0.0001);
  });
}