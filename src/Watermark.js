import React from 'react';

export default function Watermark(props) {
  if (!props.active)
    return null;

  const bg = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: props.z || 'auto',
    pointerEvents: 'none',
    paddingTop: '50%',
  };

  let text = props.text
    ? <span style={{
      fontSize: '42pt', color: 'black', position: 'absolute',
      opacity: '.3', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%) rotate(45deg)'
    }}>{props.text}</span>
    : null;

  return (
    <div style={bg}>
      <img src={props.img} style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90vw', opacity: '.2'
      }}
        alt={props.name} />
      {text}
    </div>
  );
}

