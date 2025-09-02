import { useLoader, useThree } from "@react-three/fiber";
import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AudioListener, AudioLoader } from "three";
import GunContext from "./components/gun/GunContext";

export default function Sound() {
  const sound = useRef();
  const gun = useContext(GunContext);
  const { camera } = useThree();
  const [listener] = useState(() => new AudioListener());
  const buffer = useMemo(() => useLoader(AudioLoader, "/src/assets/beefasf1.mp3"), []);

  useEffect(() => {
    camera.add(listener);
    sound.current.stop();
    sound.current.setRolloffFactor(1);
    sound.current.setRefDistance(1);
    sound.current.setBuffer(buffer);
    sound.current.setVolume(0.5);
    sound.current.setDetune(-200);
    sound.current.play();
    return () => {
      camera.remove(listener);
    }
  }, [buffer, listener]);

  return (
    <positionalAudio ref={sound} args={[listener]} />
  )
}