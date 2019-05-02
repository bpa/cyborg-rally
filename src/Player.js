import { GameContext } from './Util';
import React from 'react';
import { Box } from './UI';
import Register from './Register';
import Vitality from "./Vitality";
import Options from "./Options";
import Watermark from "./Watermark";

export default function Player(props) {
  const p = props.player;
  let watermark = null;
  if (props.register && GameContext.id === props.register.player) {
    const r = props.register.program[0].name;
    if (p.options.Brakes && r === '1') {
      watermark = <Watermark active={true} img='images/brakes.svg' text="Brakes" />
    }
    else if (p.options['Fourth Gear'] && r === '3') {
      watermark = <Watermark active={true} img='images/fourth-gear.svg' text="Fourth Gear" />
    }
    else if (p.options['Reverse Gear'] && r === 'b') {
      watermark = <Watermark active={true} img='images/reverse-gear.svg' text="Reverse Gear" />
    }
  }

  return (
    <Box round="small" background={p.ready ? 'green' : 'red'} direction="row" justify="evenly">
      <Register register={props.register} />
      {watermark}
      <Options player={p} />
      <div style={{ padding: '4px 0px' }}>{p.name}{p.shutdown ? '.zZ' : ''}</div>
      <Vitality player={p} />
    </Box >
  )
}
