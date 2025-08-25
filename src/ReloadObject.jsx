import { Outlines, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as easing from "maath/easing";
import { use, useRef } from "react";
import { ArrowHelper, Euler, Plane, Quaternion, Ray, Vector2, Vector3 } from "three";
import martiniHenryCartUrl from "./assets/martini_henry_cartridge.glb";
import GunContext from "./GunContext";
import { quat, RigidBody, vec3 } from "@react-three/rapier";
import useColliderFollower from "./hooks/useColliderFollower";

const startingRotQ = new Quaternion().setFromEuler(new Euler(Math.PI/2, 0, 0));

const loweredPos = new Vector3(-1.2, -2, -1.5);
const defaultPos = new Vector3(-1.2, -0.7, -1.5);

const cursorVec = new Vector2();
const cursorVec3D = new Vector3();

const plane = new Plane();
const planeNormal = new Vector3();
const depth = new Vector3();

const insertionObjectRelativePosition = new Vector3();
const reloadObjectScreen = new Vector3();
const insertionObjectScreen = new Vector3();

const _ = new Vector3();

// TODO: allow reload schema to specify insertion offset
export default function ReloadObject(props) {
  const model = useRef();
  const modelLocalGroup = useRef();
  const geom = useRef();
  const collider = useRef();
  const { nodes } = useGLTF(martiniHenryCartUrl)
  const { raycaster, scene } = useThree();
  const gun = use(GunContext);
  const isColliding = useRef(false);

  useColliderFollower(collider, model, modelLocalGroup);

  useFrame((state, delta) => {
    model.current.quaternion.copy(state.camera.quaternion);
    model.current.position.copy(state.camera.position);

    const colliderRotQ = quat(collider.current.rotation());
    colliderRotQ.multiply(geom.current.quaternion);
    collider.current.setRotation(colliderRotQ);

    // TODO: only affect y pos 
    if (props.grabbed) {
      // handle cartridge dragging
      // shout out to jdh for the solution
      // https://youtu.be/PcMua73C_94?si=O9yMhoDlDsONTW4k&t=299
      depth.setFromMatrixPosition(modelLocalGroup.current.matrixWorld);
      model.current.worldToLocal(depth);
      state.camera.getWorldDirection(planeNormal).negate(); // parallel to the camera

      plane.normal = planeNormal;
      plane.constant = -depth.z / (1.0 / 0.1); // honestly, this doesnt seem like a complete solution, but it works

      const x = (props.x / window.innerWidth) * 2 - 1;
      const y = ((props.y / window.innerHeight) * 2 - 1) * -1;
      cursorVec.x = x;
      cursorVec.y = y;
      
      raycaster.setFromCamera(cursorVec, state.camera);
      raycaster.ray.intersectPlane(plane, cursorVec3D);

      const collC3D = new Vector3();
      raycaster.ray.intersectPlane(plane, collC3D);

      model.current.worldToLocal(cursorVec3D);
      const diff = cursorVec3D.sub(modelLocalGroup.current.position);
      const desired = modelLocalGroup.current.position.clone().add(diff);

      const desiredWorld = model.current.localToWorld(desired.clone());
      const colDiff = vec3(collider.current.translation()).sub(desiredWorld).negate();

      collider.current.setTranslation(collC3D);
      if (!isColliding.current) {      
        modelLocalGroup.current.position.copy(desired);
      }
      //easing.damp3(modelLocalGroup.current.position, desired, 0.1, delta);
      
      // handle insertion
      const insertionObject = gun.nodes[props.insertionObjectId];
      const weaponModel = insertionObject.parent.parent;
      const weaponModelQ = weaponModel.quaternion.clone();
      
      insertionObjectScreen.setFromMatrixPosition(insertionObject.matrixWorld).project(state.camera);
      reloadObjectScreen.setFromMatrixPosition(modelLocalGroup.current.matrixWorld).project(state.camera);

      const ios = new Vector2(insertionObjectScreen.x, insertionObjectScreen.y);
      const ros = new Vector2(reloadObjectScreen.x, reloadObjectScreen.y);
      ios.x -= 0.07;
      ios.y += 0.13;

      insertionObjectRelativePosition.setFromMatrixPosition(insertionObject.matrixWorld);
      model.current.worldToLocal(insertionObjectRelativePosition);

      const startingZ = defaultPos.z;
      const targetZ = insertionObjectRelativePosition.z - 0.42;
      const zDist = targetZ - startingZ;
      const dist = ros.distanceTo(ios);
      
      let progress = dist; 
      if (progress > 1) progress = 1; // 1..0
      progress -= 1;                  // 0..-1
      progress *= -1;                 // 0..1   

      const step = startingZ + zDist * progress;

      //modelLocalGroup.current.position.setZ(step); // this causes the obj to FREAK OUT at certain points
      easing.damp(modelLocalGroup.current.position, "z", step, 1 - progress, delta);
      easing.dampQ(geom.current.quaternion, weaponModelQ, 1 - progress, delta);
    
      // TODO: do 2D collision rect here?
      if (dist <= 0.05) {
        model.current.visible = false;
        props.setReloadProgress(1);
        props.tryFinishReload();
      }      
    } else {
      geom.current.quaternion.rotateTowards(startingRotQ, 0.0174532925 / 1.5);
      const easeFinished = !easing.damp3(modelLocalGroup.current.position, props.visible ? defaultPos : loweredPos, 0.25, delta);
      if (!props.visible && easeFinished) model.current.visible = false;
      if (props.visible) model.current.visible = true;
    }
  });

  return (
    <group ref={model} scale={0.1}>
      <group ref={modelLocalGroup} position={loweredPos}>  
        <mesh ref={geom} geometry={nodes["martini_henry_cart"].geometry} layers={[1]} quaternion={startingRotQ}>
          <meshStandardMaterial color={"rgb(232, 232, 232)"}/>
          <Outlines color="black" thickness={1.5} />
        </mesh>

        <RigidBody ref={collider} gravityScale={0} colliders="trimesh" includeInvisible lockRotations scale={0.9}
          onCollisionEnter={() => {
            isColliding.current = true;
          }}
          onCollisionExit={() => {
            isColliding.current = false;
          }}
        >
          <mesh geometry={nodes["martini_henry_cart"].geometry} visible={false} />
        </RigidBody>
      </group>
    </group>
  )
}

useGLTF.preload(martiniHenryCartUrl);