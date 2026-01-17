import { Outlines, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { interactionGroups, quat, RigidBody, vec3 } from "@react-three/rapier";
import * as easing from "maath/easing";
import { use, useRef } from "react";
import { Euler, Plane, Quaternion, Vector2, Vector3 } from "three";
import useColliderFollower from "../../hooks/useColliderFollower";
import GunContext from "../gun/GunContext";

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
  const gun = use(GunContext);
  const model = useRef();
  const modelLocal = useRef();
  const mesh = useRef();
  const collider = useRef();
  const { nodes } = useGLTF(gun.schema.cartridge.url);
  const isColliding = useRef(false);

  useColliderFollower(collider, model, modelLocal);

  useFrame((state, delta) => {
    model.current.quaternion.copy(state.camera.quaternion);
    model.current.position.copy(state.camera.position);

    const colliderRotQ = quat(collider.current.rotation());
    colliderRotQ.multiply(mesh.current.quaternion);
    collider.current.setRotation(colliderRotQ);

    // TODO: only affect y pos 
    if (props.grabbed) {
      // handle cartridge dragging
      // shout out to jdh for the solution
      // https://youtu.be/PcMua73C_94?si=O9yMhoDlDsONTW4k&t=299
      depth.setFromMatrixPosition(modelLocal.current.matrixWorld);
      model.current.worldToLocal(depth);
      state.camera.getWorldDirection(planeNormal).negate(); // parallel to the camera

      plane.normal = planeNormal;
      plane.constant = -depth.z / 10.0; // honestly, this doesnt seem like a complete solution, but it works

      const x = (props.x / window.innerWidth) * 2 - 1;
      const y = ((props.y / window.innerHeight) * 2 - 1) * -1;
      cursorVec.x = x;
      cursorVec.y = y;
      
      state.raycaster.setFromCamera(cursorVec, state.camera);
      state.raycaster.ray.intersectPlane(plane, cursorVec3D);

      const collC3D = cursorVec3D.clone();

      model.current.worldToLocal(cursorVec3D);
      const diff = cursorVec3D.sub(modelLocal.current.position);
      const desired = modelLocal.current.position.clone().add(diff);

      collider.current.setTranslation(collC3D);
      if (!isColliding.current) {      
        modelLocal.current.position.copy(desired);
      }
      //easing.damp3(modelLocalGroup.current.position, desired, 0.1, delta);
      
      // handle insertion
      const insertionObject = gun.nodes[props.insertionObjectId];
      const weaponModel = insertionObject.parent.parent;
      const weaponModelQ = weaponModel.quaternion.clone();
      
      insertionObjectScreen.setFromMatrixPosition(insertionObject.matrixWorld).project(state.camera);
      reloadObjectScreen.setFromMatrixPosition(modelLocal.current.matrixWorld).project(state.camera);

      const ios = new Vector2(insertionObjectScreen.x, insertionObjectScreen.y);
      const ros = new Vector2(reloadObjectScreen.x, reloadObjectScreen.y);
      ios.x -= 0.02;
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
      const targetQ = progress < 0.3 ? startingRotQ : weaponModelQ;

      //modelLocalGroup.current.position.setZ(step); // this causes the obj to FREAK OUT at certain points
      easing.damp(modelLocal.current.position, "z", step, 1 - progress, delta);
      easing.dampQ(mesh.current.quaternion, targetQ, 1 - progress, delta);
    
      // TODO: do 2D collision rect here?
      if (dist <= 0.05) {
        model.current.visible = false;
        props.setReloadProgress(1);
        props.tryFinishReload();
      }      
    } else {
      mesh.current.quaternion.rotateTowards(startingRotQ, 0.0174532925 / 1.5);
      const easeFinished = !easing.damp3(modelLocal.current.position, props.visible ? defaultPos : loweredPos, 0.25, delta);
      if (!props.visible && easeFinished) model.current.visible = false;
      if (props.visible) model.current.visible = true;
    }
  });

  return (
    <group ref={model} scale={0.1}>
      <group ref={modelLocal} position={loweredPos}>  
        <mesh ref={mesh} geometry={nodes[gun.schema.cartridge.root].geometry} layers={[1]} quaternion={startingRotQ}>
          <meshStandardMaterial color={"rgb(232, 232, 232)"}/>
          <Outlines color="black" thickness={1.5} />
        </mesh>

        <RigidBody ref={collider} gravityScale={0} colliders="trimesh" includeInvisible lockRotations scale={[0.7, 0.7, 0.7]}
          collisionGroups={interactionGroups(1, [1])}
          onCollisionEnter={() => {
            isColliding.current = true;
          }}
          onCollisionExit={() => {
            isColliding.current = false;
          }}
        >
          <mesh geometry={nodes[gun.schema.cartridge.root].geometry} visible={false} />
        </RigidBody>
      </group>
    </group>
  )
}