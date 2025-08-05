import { Edges, Outlines, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import * as easing from "maath/easing";
import { useEffect, useRef } from "react";
import { radToDeg } from "three/src/math/MathUtils.js";
import martiniHenryUrl from "./assets/martini_henry.glb";

const adsPos = vec3({x: 0, y: -0.71, z: -6.0});
const defaultPos = vec3({x: 1.2, y: -1.0, z: -6.0});

export default function MartiniHenry(props) {
  const model = useRef();
  const modelLocalGroup = useRef();
  const { nodes } = useGLTF(martiniHenryUrl);
  const geometry = nodes["Cube001"].geometry;
  const skeleton = nodes["Cube001"].skeleton;

  useEffect(() => {
    console.log(nodes);
  }, []);

  useFrame((state, delta) => { 
    easing.dampQ(model.current.quaternion, state.camera.quaternion, 0.25, delta, 1, easing.exp, 0.0001);
    model.current.position.copy(state.camera.position);
    easing.damp3(modelLocalGroup.current.position, props.isAiming ? adsPos : defaultPos, 0.25, delta);
  });

  return(
    <group ref={model} dispose={null} scale={0.1}>
      <group ref={modelLocalGroup} position={defaultPos}>
        <mesh geometry={nodes["ironsight"].geometry} renderOrder={1}>
          <meshPhysicalMaterial
            color="rgb(232, 232, 232)" 
            transparent={props.isAiming} 
            opacity={props.isAiming ? 0.45 : 1} 
            transmission={props.isAiming ? 0 : 1}
            blendAlpha={false}
          />
          {!props.isAiming && <Outlines color="black" thickness={1.5} angle={radToDeg(180)} />}
          {!props.isAiming && <Edges color="black" lineWidth={1} />}
        </mesh>

        <primitive object={nodes["body"]} />
        <skinnedMesh geometry={geometry} skeleton={skeleton}>
          <meshStandardMaterial color="rgb(232, 232, 232)" />
          <Outlines color="black" thickness={1.5} angle={radToDeg(180)} />
          <Edges color="black" lineWidth={1} />    
        </skinnedMesh> 
      </group>
    </group>
  );
}

useGLTF.preload("/assets/martini_henry.glb");
