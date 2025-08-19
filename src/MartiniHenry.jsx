import { Edges, Outlines, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as easing from "maath/easing";
import { Fragment, useEffect, useRef } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import martiniHenryUrl from "./assets/martini_henry.glb";

const defaultRot = new Euler(0, 0, 0);
const reloadRot =  new Euler(degToRad(7), degToRad(-5), degToRad(8));

const positions = {
  ads: new Vector3(0, -0.71, -6.0),
  default: new Vector3(1.2, -1.0, -6.0),
  reload: new Vector3(1.2, -1.0, -5.0)
};

const rotations = {
  default: new Quaternion().setFromEuler(defaultRot),
  reload: new Quaternion().setFromEuler(reloadRot)
};

export default function MartiniHenryModel(props) {
  const model = useRef();
  const modelLocalGroup = useRef();
  const { nodes } = useGLTF(martiniHenryUrl);
  const geometry = nodes["Cube001"].geometry;
  const skeleton = nodes["Cube001"].skeleton;
  props.modelNodesRef.current = nodes;

  // correct some odd rotation behaviour, might be gimbal lock?
  useEffect(() => {
    nodes["breachblock"].rotation.x = Math.PI / 2;
    nodes["breachblock"].rotation.y = Math.PI / 2;
    nodes["breachblock"].rotation.z = -Math.PI / 2;  
  }, []);

  useFrame((state, delta) => {
    easing.dampQ(model.current.quaternion, state.camera.quaternion, 0.25, delta, 1, easing.exp, 0.0001);
    model.current.position.copy(state.camera.position);

    const desiredPos = props.reloadOverrides.current.position === null || !props.isReloading ? 
      (props.isAiming ? positions.ads : positions.default) : positions[props.reloadOverrides.current.position];

    const desiredRot = props.reloadOverrides.current.rotation === null || !props.isReloading ? 
      rotations.default : rotations[props.reloadOverrides.current.rotation];

    easing.damp3(modelLocalGroup.current.position, desiredPos, 0.25, delta);
    easing.dampQ(modelLocalGroup.current.quaternion, desiredRot, 0.25, delta, 1, easing.exp, 0.0001);
  });

  return(
    <Fragment>     
      <group ref={model} dispose={null} scale={0.1} name="global">
        <group ref={modelLocalGroup} position={positions.default} name="local">
  
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
            <Outlines color="black" thickness={1.5} />
          </skinnedMesh>
        </group>
      </group>
    </Fragment>
  );
}
