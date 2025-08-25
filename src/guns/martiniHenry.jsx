import { Euler, Quaternion, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

const defaultRot = new Euler(0, 0, 0);
const reloadRot = new Euler(degToRad(7), degToRad(-5), degToRad(8));
const recoilRot = new Euler(degToRad(0.3), degToRad(0.2), 0);

const martiniHenry = {
  id: "martini_henry",

  data: {
    name: "Martini–Henry",
    description: "British breech-loading rifle with lever-actuated falling block action",
    cartridge: "577/450",
    muzzleVelocity: 411,
    dragCoeff: 1.0,
    oneInChamber: true,
    magazineSize: 1
  },

  sfx: {
    shoot: "/src/assets/martini_henry_shoot.wav"
  },

  model: {
    url: "/src/assets/martini_henry.glb",
    root: "Cube001",
    rootBone: "body",
    positions: {
      default: new Vector3(1.2, -1.0, -6.0),
      reload: new Vector3(1.2, -1.0, -5.0),
      ads: new Vector3(0, -0.71, -6.0),
    },
    rotations: {
      default: new Quaternion().setFromEuler(defaultRot),
      reload: new Quaternion().setFromEuler(reloadRot),
      recoil: new Quaternion().setFromEuler(recoilRot),
    },
  },

  cartridge: {
    url: "/src/assets/martini_henry_cartridge.glb",
    root: "martini_henry_cart",
    rotations: {
      default: new Quaternion().setFromEuler(new Euler(Math.PI/2, 0, 0))
    }
  },

  casing: {
    url: "/src/assets/martini_henry_casing.glb",
    root: "martini_henry_casing",
  },

  reloadSchema: [
    {
      type: ReloadMethodTypes.MOUSE_MOTION,
      length: 2,
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
      refreshMagazine: false,
      rotationOverride: "reload",
      positionOverride: "reload",
      insertionObjectId: "breachblock"
    },
    {
      type: ReloadMethodTypes.MOUSE_MOTION,
      length: 2,
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
  ],
};

export default martiniHenry