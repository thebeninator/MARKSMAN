import { useFrame, useThree } from "@react-three/fiber";
import { Fragment, useEffect, useRef, useState } from "react";
import martiniHenryCartUrl from "./assets/martini_henry_cart.glb";
import { Edges, Outlines, Sphere, useGLTF } from "@react-three/drei";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import * as easing from "maath/easing";
import { Euler, Plane, PlaneHelper, Quaternion, Vector3 } from "three";

const loweredPos = new Vector3(-1.2, -2, -1.5);
const defaultPos = new Vector3(-1.2, -0.7, -1.5);
const cursorVec = new Vector3();
const modelToCamVec = new Vector3();
const plane = new Plane();
const planeNormal = new Vector3();

export default function ReloadObject(props) {
  const model = useRef();
  const modelLocalGroup = useRef();
  const { nodes } = useGLTF(martiniHenryCartUrl)
  const { camera, scene, raycaster } = useThree();
  const box = useRef();

  useFrame((state, delta) => {     
    const rot = new Quaternion().copy(state.camera.quaternion);
    model.current.quaternion.copy(rot);
    model.current.position.copy(state.camera.position);

    // TODO: only affect y pos 
    if (!props.grabbed) {
      const easeFinished = easing.damp3(modelLocalGroup.current.position, props.visible ? defaultPos : loweredPos, 0.25, delta);
      if (!props.visible && easeFinished) model.visible = false;
      if (props.visible) model.visible = true;
    } else {
      state.camera.getWorldDirection(planeNormal).negate(); // parallel to the camera & facing it 
      plane.normal = planeNormal;
      plane.constant = 0.15000000000000002; // object centre
      const helper = new PlaneHelper( plane, 1, 0xffff00 );
      scene.add( helper );
      setTimeout(() => {
        scene.remove(helper);
      }, 0.01);

      // NDC coords
      const x = (props.x / window.innerWidth) * 2 - 1;
      const y = ((props.y / window.innerHeight) * 2 - 1) * -1;
      cursorVec.x = x;
      cursorVec.y = y;

      const cursorVec3D = new Vector3().copy(cursorVec);
      raycaster.setFromCamera(cursorVec, state.camera);
      raycaster.ray.intersectPlane(plane, cursorVec3D);
      const s = cursorVec3D.clone();
      modelLocalGroup.current.worldToLocal(s);
      modelLocalGroup.current.position.add(s);
    }
  });

  return (
    <Fragment>
      <group ref={model} scale={0.1}>
        <group ref={modelLocalGroup} position={loweredPos}>  
          <mesh geometry={nodes["martini_henry_cart"].geometry} layers={[1]}>
            <meshStandardMaterial color={"rgb(232, 232, 232)"}/>
            <Outlines color="black" thickness={1.5} angle={radToDeg(180)} />
          </mesh>
        </group>
      </group>
    </Fragment>
  )
}
