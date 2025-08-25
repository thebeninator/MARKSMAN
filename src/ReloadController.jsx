import { useThree } from "@react-three/fiber";
import { Fragment, use, useEffect, useRef, useState } from "react";
import { Vector2, Vector3 } from "three";
import Casing from "./Casing";
import useMouseButtonHeldHandler from "./hooks/gunHooks/useMouseButtonHeldHandler";
import ReloadCursor from "./ReloadCursor";
import ReloadObject from "./ReloadObject";
import GunContext from "./GunContext";

// TODO: maybe should create context for casings?
const casingPosition = new Vector3();
const casingVelocity = new Vector3(0, 0, 0);
const casingAngularVelocity  = new Vector3(0, 6, 3);

const ReloadMethodTypes = Object.freeze({
  MOUSE_MOTION: 0,
  GRABBER: 1,
});

const Directions = Object.freeze({
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
});

const MARTINI_HENRY_RELOAD = [
  {
    type: ReloadMethodTypes.MOUSE_MOTION,
    sensitivity: 2,
    length: 0.5,
    refreshMagazine: false,
    direction: Directions.UP,
    ejectCartridge: true,
    bones: [
      {
        name: "lever",
        property: "rotation",
        axis: "y",
        starting: -1.1980975954537447,
        target: -0.5,
      },
      {
        name: "breachblock",
        property: "rotation",
        axis: "y",
        starting: 1.5707963267948966,
        target: 1.30,
      },
    ]
  },
  {
    type: ReloadMethodTypes.GRABBER,
    sensitivity: 1,
    refreshMagazine: false,
    rotationOverride: "reload",
    positionOverride: "reload",
    insertionObjectId: "breachblock"
  },
  {
    type: ReloadMethodTypes.MOUSE_MOTION,
    sensitivity: 2,
    length: 0.5,
    refreshMagazine: true,
    direction: Directions.DOWN,
    bones: [
      {
        name: "lever",
        property: "rotation",
        axis: "y",
        starting: -0.5,
        target:  -1.1980975954537447,
      },
      {
        name: "breachblock",
        property: "rotation",
        axis: "y",
        starting: 1.30,
        target: 1.5707963267948966,
      },
    ]    
  },
];

const grabRayOrigin = new Vector2();

// TODO: this component is way too large -> can we break this down into more custom hooks?
export default function ReloadController(props) {
  const reloadSchema = useRef(MARTINI_HENRY_RELOAD);
  const [reloadStage, setReloadStage] = useState(0);
  const [reloadProgress, setReloadProgress] = useState(0); // 0..1
  const reloadComplete = useRef(false);
  const [cursorX, setX] = useState(window.innerWidth / 2);
  const [cursorY, setY] = useState(window.innerHeight / 2);
  const { raycaster, camera, scene } = useThree();
  const { holdingLeftClick, holdingRightClick } = useMouseButtonHeldHandler();
  const [reloadObjectGrabbed, setReloadObjectGrabbed] = useState(false);
  const [casings, setCasings] = useState([]);
  const gun = use(GunContext);
  
  const setReloadProgressHandler = (progress) => {
    setReloadProgress(progress);
  }
  
  const canReload = () => {
    return (props.isReloading && !reloadComplete.current);
  }

  const getReloadSchema = () => {
    const totalStages = reloadSchema.current.length;
    const currStage = reloadSchema.current[reloadStage];
    const currStageIdx = reloadStage;
    return { totalStages, currStage, currStageIdx };
  }

  const currStageTypeOf = (type) => {
    return reloadSchema.current[reloadStage].type === type;
  }

  const handleEjection = () => {
    props.magazineCount.current = 0;
    
    casingPosition.setFromMatrixPosition(gun.nodes["breachblock"].matrixWorld); 
    casingVelocity.setX(0).setY(0).setZ(1).unproject(camera).normalize().multiplyScalar(4.5);
    casingVelocity.setZ(-casingVelocity.z);

    const newCasing = {
      id: crypto.randomUUID(),
      position: casingPosition.add(new Vector3(0, 0.008, 0)),
      velocity: casingVelocity,
      angVelocity: casingAngularVelocity
    };
    setCasings(prev => ([...prev, newCasing]));
  }

  const tryFinishReload = () => {
    if (reloadProgress < 1) return false;

    const { totalStages, currStage, currStageIdx } = getReloadSchema();
    const nextStageIdx = currStageIdx + 1;

    setReloadObjectGrabbed(false);
    setReloadProgress(0);
    setReloadStage(nextStageIdx);
    if (currStage.refreshMagazine) props.magazineCount.current = 1;
    if (currStage.ejectCartridge) handleEjection();

    if (currStageIdx + 1 === totalStages) {
      reloadComplete.current = true;
      setReloadStage(0);
    }

    return true;
  }

  useEffect(() => {
    if (!props.isReloading) return;

    const { currStage } = getReloadSchema();
    props.reloadOverrides.current.rotation = currStage.rotationOverride ?? null;
    props.reloadOverrides.current.position = currStage.positionOverride ?? null;

  }, [props.isReloading, reloadStage]);

  useEffect(() => {
    if (!holdingLeftClick) {
      setReloadObjectGrabbed(false);
    }
  }, [holdingLeftClick]);

  useEffect(() => {
    const grabberReloadGrab = (e) => {
      if (e.button !== 0) return;
      // convert 2D space to NDC space
      // x / w => 0..1
      // then multiply by 2 => 0..2
      // then sub 1 => -1..1
      const x = (cursorX / window.innerWidth) * 2 - 1;
      const y = ((cursorY / window.innerHeight) * 2 - 1) * -1; // up is positive y in NDC space
      grabRayOrigin.x = x;
      grabRayOrigin.y = y
      raycaster.setFromCamera(grabRayOrigin, camera);
      raycaster.layers.set(1);
      const intersections = raycaster.intersectObjects(scene.children);

      setReloadObjectGrabbed(intersections.length > 0);
    }

    window.addEventListener("mousedown", grabberReloadGrab); 
    return () => window.removeEventListener("mousedown", grabberReloadGrab); 
  }, [cursorX, cursorY]);

  useEffect(() => {
    const grabberReloadMotion = (e) => {
      if (!canReload()) return; 
      if (!currStageTypeOf(ReloadMethodTypes.GRABBER)) return;
      if (!holdingRightClick) return;
      
      const dx = e.movementX;
      const dy = e.movementY;
      const innerWidth = window.innerWidth;
      const innerHeight = window.innerHeight;

      setX(prevX => (prevX + dx));
      setY(prevY => (prevY + dy));

      if (cursorX + dx < 0.001) setX(0);
      if (cursorY + dy < 0.001) setY(0);
      if (cursorX + dx > innerWidth) setX(innerWidth);
      if (cursorY + dy > innerHeight) setY(innerHeight);
    };
    window.addEventListener("mousemove", grabberReloadMotion); 

    return () => window.removeEventListener("mousemove", grabberReloadMotion); 
  }, [reloadStage, props.isReloading, holdingRightClick, cursorX, cursorY]);

  useEffect(() => {
    const motionReload = (e) => {
      if (!canReload()) return; 
      if (!currStageTypeOf(ReloadMethodTypes.MOUSE_MOTION)) return;

      const { currStage } = getReloadSchema();
      const mouseMovedDown = e.movementY > 0 && currStage.direction === Directions.DOWN;
      const mouseMovedUp = e.movementY < 0 && currStage.direction === Directions.UP;

      if (mouseMovedDown || mouseMovedUp) {
        setReloadProgress(prev => (prev + Math.abs(e.movementY) / currStage.length / 100.0));
        const finished = tryFinishReload();

        if (currStage.bones) {
          for (let i = 0; i < currStage.bones.length; i++) {
            const { name, property, axis, target, starting } = currStage.bones[i]; 
            const dist = target - starting; 
            let step = starting + dist * reloadProgress;
            if (
              (step > target && starting < target)  
              || (step < target && starting > target) 
              || finished
            ) {            
              step = target;
            }
            
            gun.nodes[name][property][axis] = step;
          }
        }
      }
    };

    window.addEventListener("mousemove", motionReload); 
    return () => window.removeEventListener("mousemove", motionReload);
  }, [casings, reloadProgress, reloadStage, props.isReloading]);

  useEffect(() => {
    const keydown = (e) => {
      if (e.code === "KeyR") props.setReloading(true);
    };
    window.addEventListener("keydown", keydown);

    const keyup = (e) => {
      if (e.code === "KeyR") { 
        props.setReloading(false);
        reloadComplete.current = false;
        setReloadObjectGrabbed(false);
      }
    };
    window.addEventListener("keyup", keyup);

    return () => {
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("keyup", keyup)
    }
  }, [props.isReloading]);

  return (
    <Fragment>
      <ReloadObject 
        x={cursorX} y={cursorY} 
        grabbed={reloadObjectGrabbed} 
        visible={currStageTypeOf(ReloadMethodTypes.GRABBER) && props.isReloading}
        insertionObjectId={reloadSchema.current[reloadStage].insertionObjectId ?? null}
        setReloadProgress={setReloadProgressHandler}
        tryFinishReload={tryFinishReload}
      />

      {/*casings.map(casing => 
        <Casing
          key={casing.id} id={casing.id}
          position={casing.position}
          velocity={casing.velocity}
          angVelocity={casing.angVelocity} 
        />
      )*/}

      <props.ui.In>
        {currStageTypeOf(ReloadMethodTypes.GRABBER) && props.isReloading && <ReloadCursor x={cursorX} y={cursorY} />}

        {currStageTypeOf(ReloadMethodTypes.GRABBER) && props.isReloading &&
          <div key="r" style={{
            position: "absolute",
            left: `${cursorX + 50}px`,
            top: `${cursorY - 50}px`,
          }}>     
            <p>{reloadObjectGrabbed ? ".577/450 cartridge" : ""}</p>
          </div>
        } 
      </props.ui.In>  
    </Fragment>
  ); 
}