export default function ReloadCursor(props) {
  return (
    <div key="reload" style={{
      position: "absolute",
      left: `${props.x}px`,
      top: `${props.y}px`,
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      transform: "translate3d(-50%, -50%, 0)",
      border: "2px solid rgb(0, 0, 0)"
    }}/>
  );
}