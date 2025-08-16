import { useFrame } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useRef } from "react";
import martiniHenryCartUrl from "./assets/martini_henry_cart.glb";
import { Edges, Outlines, useGLTF } from "@react-three/drei";
import { radToDeg } from "three/src/math/MathUtils.js";
import * as easing from "maath/easing";
import { Vector3 } from "three";

const loweredPos = vec3({x: -1.2, y: -2, z: -1.5});
const defaultPos = vec3({x: -1.2, y: -0.7, z: -1.5});
const cursorWorldVec = new Vector3();
const modelToCamVec = new Vector3();

export default function ReloadObject(props) {
  const model = useRef();
  const modelLocalGroup = useRef();
  const { nodes } = useGLTF(martiniHenryCartUrl)

  useFrame((state, delta) => {     
    model.current.quaternion.copy(state.camera.quaternion);
    model.current.position.copy(state.camera.position);

    // TODO: only affect y pos 
    if (!props.grabbed) {
      const easeFinished = easing.damp3(modelLocalGroup.current.position, props.visible ? defaultPos : loweredPos, 0.25, delta);
      if (!props.visible && easeFinished) model.visible = false;
      if (props.visible) model.visible = true;
    } else {
      modelToCamVec.copy(state.camera.position);
      modelToCamVec.sub(modelLocalGroup.current.position);
      const dist = modelToCamVec.length();

      // convert to NDC
      const x = (props.x / window.innerWidth) * 2 - 1;
      const y = ((props.y / window.innerHeight) * 2 - 1) * -1;
      cursorWorldVec.x = x;
      cursorWorldVec.y = y;
      cursorWorldVec.z = 0.5;

      // convert to world
      cursorWorldVec.unproject(state.camera);

      // convert to local 
      const cursorLocalVec = modelLocalGroup.current.worldToLocal(cursorWorldVec);
      cursorLocalVec.sub(state.camera.position).normalize().multiplyScalar(dist);
      cursorLocalVec.setZ(-1.5);
      
      modelLocalGroup.current.position.copy(cursorLocalVec);
    }
  });

  return (
    <group ref={model} dispose={null} scale={0.1}>
      <group ref={modelLocalGroup} position={loweredPos}>  
        <mesh geometry={nodes["martini_henry_cart"].geometry} layers={[1]}>
          <meshStandardMaterial color={props.grabbed ? "rgb(255, 251, 0)" : "rgb(232, 232, 232)"}/>
          <Outlines color="black" thickness={1.5} angle={radToDeg(180)} />
          <Edges color="black" lineWidth={1} />    
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload("/assets/martini_henry_cart.glb");