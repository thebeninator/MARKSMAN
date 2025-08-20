import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { euler, vec3 } from "@react-three/rapier";
import { Fragment, useEffect, useRef, useState } from "react";
import Bullet from "./Bullet";
import MartiniHenryModel from "./MartiniHenry";
import * as easing from "maath/easing";
import useAdsController from "./gunHooks/useAdsController";
import ReloadController from "./ReloadController";

export default function GunController(props) {
  const [bullets, setBullets] = useState([]);
  const [isReloading, setReloading] = useState(false);
  const pointerLocked = useRef(false);
  const magazineCount = useRef(1);  
  const { camera } = useThree();
  const { isAiming } = useAdsController(pointerLocked, isReloading);
  const modelNodesRef = useRef();
  const reloadOverrides = useRef({rotation: null, position: null});
  const [justShot, setJustShot] = useState(false);

  const setReloadingHandler = (isReloading) => {
    setReloading(isReloading);
  }

  const getPointerSpeed = () => {
    if (isReloading) return 0;
    if (isAiming) return (props.aimZoom * 2) / camera.fov;  
    return 1;
  }

  const destroyBullet = (id) => {
    const temp = bullets.filter(bullet => bullet.id !== id); 
    setBullets(temp);
  }

  const onBulletHit = (manifold, id) => {
    destroyBullet(id);
  }
  
  useFrame((state, delta) => {
    const targetZoom = isAiming ? props.aimZoom : props.defaultZoom;

    if (state.camera.zoom !== targetZoom) {
      easing.damp(state.camera, "zoom", targetZoom, 0.25, delta);
      state.camera.updateProjectionMatrix();
    }
  });

  useEffect(() => {
    const shoot = (e) => {
      if (e.button !== 0) return;
      if (!pointerLocked.current) return;
      if (isReloading) return;
      if (magazineCount.current <= 0) return;
      
      setJustShot(true);
      setTimeout(() => {
        setJustShot(false);
      }, 1);

      const newBullet = {
        id: crypto.randomUUID(), 
        rotation: euler().copy(camera.rotation),
        position: vec3().copy(camera.position).add(camera.getWorldDirection(vec3()).multiplyScalar(5)),
        muzzleVelocityVector: vec3({x: 0, y: 0, z: 1}).unproject(camera).normalize().multiplyScalar(411)
      };
      magazineCount.current -= 1;
      setBullets(prev => ([...prev, newBullet]));
    };

    window.addEventListener("mousedown", shoot);
    return () => window.removeEventListener("mousedown", shoot);
  }, [bullets, isReloading, justShot]);

  return (
    <Fragment>
      <ReloadController 
        ui={props.ui}
        magazineCount={magazineCount} 
        isReloading={isReloading} 
        setReloading={setReloadingHandler} 
        modelNodesRef={modelNodesRef}
        reloadOverrides={reloadOverrides}
      />

      <MartiniHenryModel 
        isAiming={isAiming} 
        isReloading={isReloading} 
        modelNodesRef={modelNodesRef}
        reloadOverrides={reloadOverrides}
        justShot={justShot}
      />

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