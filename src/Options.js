import React from 'react';
import { Option } from './Option';

export default function Options(props) {
  let opts = props.player.options;
  if (!opts) {
    return null;
  }
  opts = Object.values(opts).sort((a, b) => a.name < b.name);
  let w = Math.floor((opts.length + 1) / 2) * 20;
  let style = { height: "20px", float: "left" };
  return (
    <div style={{ width: w + "px" }}>
      {opts.map((o) => <Option style={style} card={o} key={o.name} />)}
    </div>
  )
}
