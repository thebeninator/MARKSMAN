import { Edges, Outlines, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as easing from "maath/easing";
import { useRef } from "react";
import { Euler, Plane, Quaternion, Vector2, Vector3 } from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import martiniHenryCartUrl from "./assets/martini_henry_cartridge2.glb";

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

export default function ReloadObject(props) {
  const model = useRef();
  const modelLocalGroup = useRef();
  const geom = useRef();
  const { nodes } = useGLTF(martiniHenryCartUrl)
  const { raycaster } = useThree();

  useFrame((state, delta) => {
    model.current.quaternion.copy(state.camera.quaternion);
    model.current.position.copy(state.camera.position);
    geom.current.quaternion.rotateTowards(startingRotQ, 0.0174532925 / 2);

    // TODO: only affect y pos 
    if (props.grabbed) {
      // handle cartridge dragging
      // shout out to jdh for the solution
      // https://youtu.be/PcMua73C_94?si=O9yMhoDlDsONTW4k&t=299
      depth.copy(modelLocalGroup.current.position);
      model.current.localToWorld(depth);
      state.camera.getWorldDirection(planeNormal).negate(); // parallel to the camera

      plane.normal = planeNormal;
      plane.constant = -depth.z;

      const x = (props.x / window.innerWidth) * 2 - 1;
      const y = ((props.y / window.innerHeight) * 2 - 1) * -1;
      cursorVec.x = x;
      cursorVec.y = y;

      raycaster.setFromCamera(cursorVec, state.camera);
      raycaster.ray.intersectPlane(plane, cursorVec3D);
      model.current.worldToLocal(cursorVec3D);
      const diff = cursorVec3D.sub(modelLocalGroup.current.position);
      modelLocalGroup.current.position.add(diff);
      
      // handle insertion
      const insertionObject = props.modelNodesRef.current[props.insertionObjectId];
      const weaponModel = insertionObject.parent.parent;
      const weaponModelQ = weaponModel.quaternion.clone();
      
      insertionObjectScreen.setFromMatrixPosition(insertionObject.matrixWorld).project(state.camera);
      reloadObjectScreen.setFromMatrixPosition(modelLocalGroup.current.matrixWorld).project(state.camera);

      const ios = new Vector2(insertionObjectScreen.x, insertionObjectScreen.y);
      const ros = new Vector2(reloadObjectScreen.x, reloadObjectScreen.y);
      ios.y += 0.10;

      insertionObjectRelativePosition.setFromMatrixPosition(insertionObject.matrixWorld);
      model.current.worldToLocal(insertionObjectRelativePosition);

      const startingZ = defaultPos.z;
      const targetZ = insertionObjectRelativePosition.z - 0.35;
      const zDist = targetZ - startingZ;
      
      const dist = ros.distanceTo(ios);
      
      let progress = dist; 
      if (progress > 1) progress = 1; // 1..0
      progress -= 1;                  // 0..-1
      progress *= -1;                 // 0..1   

      //let step = startingZ + zDist * progress;

      //modelLocalGroup.current.position.setZ(step);
      easing.damp(modelLocalGroup.current.position, "z", targetZ, 1 - progress, delta, 5);
      easing.dampQ(geom.current.quaternion, weaponModelQ, 1 - progress, delta);
    
      // TODO: do 2D collision rect here?
      if (dist <= 0.05) {
        model.current.visible = false;
        props.setReloadProgress(1);
        props.tryFinishReload();
      }      
    } else {
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
          <Outlines color="black" thickness={1.5} angle={radToDeg(180)} />
        </mesh>
      </group>
    </group>
  )
}
