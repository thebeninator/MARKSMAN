import { Sparkles } from "@react-three/drei";
import { Color } from "three";

export default function Fireflies(props) {
  return (
    <Sparkles 
      count={25} 
      scale={5} 
      size={2} 
      speed={0.5} 
      noise={[2, 0, 2]}
      opacity={1} 
      position={props.position}
      color={new Color(0.4, 1, 0.4)} 
    />
  );
}