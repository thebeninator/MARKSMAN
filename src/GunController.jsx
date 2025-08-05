import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { euler, vec3 } from "@react-three/rapier";
import { Fragment, useEffect, useRef, useState } from "react";
import Bullet from "./Bullet";
import MartiniHenry from "./MartiniHenry";
import * as easing from "maath/easing";
import useReloadController from "./gunHooks/useReloadController";
import useAdsController from "./gunHooks/useAdsController";

export default function GunController(props) {
  const {camera} = useThree();
  const [bullets, setBullets] = useState([]);
  const pointerLocked = useRef(false);
  const {isReloading}  = useReloadController();
  const {isAiming} = useAdsController(pointerLocked, isReloading);

  const getPointerSpeed = () => {
    if (isReloading) {
      return 0;
    }

    if (isAiming) {
      return (props.aimZoom * 2) / camera.fov;
    }    

    return 1;
  }

  const destroyBullet = (id) => {
    const temp = bullets.filter(bullet => bullet.id !== id); 
    setBullets(temp);
  }

  const onBulletHit = (manifold, id) => {
    if (manifold !== null) {
    }

    destroyBullet(id);
  }
  
  useFrame((state, delta, frame) => {
    const targetZoom = isAiming ? props.aimZoom : props.defaultZoom;

    easing.damp(state.camera, "zoom", targetZoom, 0.25, delta);
    state.camera.updateProjectionMatrix();
  });

  useEffect(() => {
    const shoot = (e) => {
      if (!isReloading && e.button === 0 && pointerLocked.current) {
        const newBullet = {
          id: crypto.randomUUID(), 
          rotation: euler().copy(camera.rotation),
          position: vec3().copy(camera.position).add(camera.getWorldDirection(vec3()).multiplyScalar(5)),
          muzzleVelocityVector: vec3({x: 0, y: 0, z: 1}).unproject(camera).normalize().multiplyScalar(411)
        };
        setBullets(prev => ([...prev, newBullet]));
      }
    }

    window.addEventListener("mousedown", shoot);
    return () => window.removeEventListener("mousedown", shoot);
  }, [bullets, isReloading]);

  return (
    <Fragment>
      <MartiniHenry isAiming={isAiming} />

      {bullets.map(bullet => 
        <Bullet
          key={bullet.id} id={bullet.id} 
          rotation={bullet.rotation} 
          position={bullet.position}
          muzzleVelocityVector={bullet.muzzleVelocityVector}
          destroyBullet={destroyBullet}
          onBulletHit={onBulletHit}
        />
      )}

      <PointerLockControls 
        camera = {camera}
        onLock={ (e) => {pointerLocked.current = true } }
        onUnlock={ (e) => {pointerLocked.current = false} }
        pointerSpeed={getPointerSpeed()}
      />
    </Fragment>
  );
}