import { GameContext } from './Util';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Ready from './Ready';
import Players from './Players';
import { Content } from './UI';
import Watermark from './Watermark';

export default observer(() => {
  let context = useContext(GameContext);
  let state = context.public.state;
  let options = context.me.options || {};
  let stabilizer = options['Gyroscopic Stabilizer'];
  let usingGyro = (state.includes('conveyor') || state === "gears")
    && stabilizer !== undefined && stabilizer.tapped;

  return (
    <Content>
      <Ready />
      <hr />
      <Players />
      <Watermark active={usingGyro}
        img='images/gyroscopic-stabilizer.svg'
        text="Gyroscopic Stabilizer" />
    </Content>
  );
});
