import React from 'react';
import Icon from './Icon';

export default function Register(props) {
  if (!props.register) {
    return <div style={{ width: "16px" }} />;
  }
  const program = props.register.program;
  var name = program.reduce((a, b) => a + b.name, '');
  let className = props.className;
  if (props.register.locked) {
    className = className + ' locked';
  }
  return (
    <Icon
      onClick={props.onClick}
      className={className}
      card={{ name: name || 'null' }} />
  )
}
