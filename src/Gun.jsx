import { Outlines, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Fragment, useEffect, useRef } from "react";
import { Vector3 } from "three";
import martiniHenryUrl from "./assets/martini_henry.glb";
import GunContext from "./GunContext";
import useColliderFollower from "./hooks/useColliderFollower";

export default function Gun(props) {
  const { nodes } = useGLTF(martiniHenryUrl);
  const model = useRef();
  const modelLocalGroup = useRef();
  const collider = useRef();
  const geometry = nodes["Cube001"].geometry;
  const skeleton = nodes["Cube001"].skeleton;

  useColliderFollower(collider, model, modelLocalGroup);

  // correct some odd rotation behaviour, might be gimbal lock?
  useEffect(() => {
    nodes["breachblock"].rotation.x = Math.PI / 2;
    nodes["breachblock"].rotation.y = Math.PI / 2;
    nodes["breachblock"].rotation.z = -Math.PI / 2;  
  }, []);
  
  return (
    <Fragment>
      <group ref={model} dispose={null} scale={0.1} name="global">
        <group ref={modelLocalGroup} name="local" position={new Vector3(1.2, -1.0, -6.0)}>
          {/* ironsights used to be transparent on ADS, hence why its a separate mesh */}
          <mesh geometry={nodes["ironsight"].geometry} renderOrder={1}>            
            <meshStandardMaterial color="rgb(232, 232, 232)" />
            <Outlines color="black" thickness={1.5} />
          </mesh>

          <primitive object={nodes["body"]}/>
          <skinnedMesh geometry={geometry} skeleton={skeleton}>
            <meshStandardMaterial color="rgb(232, 232, 232)" />
            <Outlines color="black" thickness={1.5} />
          </skinnedMesh>

          <RigidBody ref={collider} gravityScale={0} colliders="trimesh" includeInvisible lockTranslations lockRotations>
            <mesh geometry={nodes["collider008"].geometry} visible={false} />
          </RigidBody>
        </group>
      </group>

      <GunContext.Provider value={{
        nodes: nodes,
        model: model,
        modelLocalGroup: modelLocalGroup
      }}>
        {props.children}
      </GunContext.Provider>
    </Fragment>
  );
}

useGLTF.preload(martiniHenryUrl);