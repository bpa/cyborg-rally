import { GameContext } from './Util';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Ready from './Ready';
import Players from './Players';
import { Content } from './UI';
import Watermark from './Watermark';

export default observer(() => {
  let context = useContext(GameContext);
  var filter = undefined;
  if (['Configuring', 'PowerDown', 'Revive'].includes(context.public.state)) {
    filter = (pid) => {
      console.log(pid, context.public.player[pid].name, context.state[pid]);
      return context.state[pid] !== undefined;
    }
  }
  let state = context.public.state;
  let options = context.me.options || {};
  let stabilizer = options['Gyroscopic Stabilizer'];
  let usingGyro = (state.includes('conveyor') || state === "gears")
    && stabilizer !== undefined && stabilizer.tapped;

  return (
    <Content>
      <Ready filter={filter} />
      <hr />
      <Players filter={filter} />
      <Watermark active={usingGyro}
        img='images/gyroscopic-stabilizer.svg'
        text="Gyroscopic Stabilizer" />
    </Content>
  );
});
