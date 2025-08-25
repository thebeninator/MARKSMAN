import { useFrame } from "@react-three/fiber";
import * as easing from "maath/easing";
import { use, useEffect } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import GunContext from "../../GunContext";

const defaultRot = new Euler(0, 0, 0);
const reloadRot = new Euler(degToRad(7), degToRad(-5), degToRad(8));
const recoilRot = new Euler(degToRad(0.3), degToRad(0.2), 0);

const positions = {
  ads: new Vector3(0, -0.71, -6.0),
  default: new Vector3(1.2, -1.0, -6.0),
  reload: new Vector3(1.2, -1.0, -5.0)
};

const rotations = {
  default: new Quaternion().setFromEuler(defaultRot),
  reload: new Quaternion().setFromEuler(reloadRot),
  recoil: new Quaternion().setFromEuler(recoilRot)
};

export default function useModelController(props) {
  const gun = use(GunContext);

  useEffect(() => {
    if (!props.justShot) return; 
    gun.model.current.quaternion.multiply(rotations.recoil);
    gun.modelLocalGroup.current.position.setZ(gun.modelLocalGroup.current.position.z + 0.30);
    gun.modelLocalGroup.current.position.setY(gun.modelLocalGroup.current.position.y + 0.01);
  }, [props.justShot]);

  useFrame((state, delta) => {
    const desiredRotQ = state.camera.quaternion.clone();
    easing.dampQ(gun.model.current.quaternion, desiredRotQ, 0.25, delta, 1, easing.exp, 0.0001);
    gun.model.current.position.copy(state.camera.position);

    const desiredPos = props.reloadOverrides.current.position === null || !props.isReloading ? 
      (props.isAiming ? positions.ads : positions.default) : positions[props.reloadOverrides.current.position];

    const desiredRot = props.reloadOverrides.current.rotation === null || !props.isReloading ? 
      rotations.default : rotations[props.reloadOverrides.current.rotation];

    easing.damp3(gun.modelLocalGroup.current.position, desiredPos, 0.25, delta);
    easing.dampQ(gun.modelLocalGroup.current.quaternion, desiredRot, 0.25, delta, 1, easing.exp, 0.0001);
  });
}