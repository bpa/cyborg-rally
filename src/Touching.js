import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import { Tile, TileSet } from './TileSet';
import { Button } from './UI';
import Watermark from './Watermark';
import { observer } from 'mobx-react-lite';

function touch(tile) {
  ws.send({ cmd: 'touch', tile: tile });
}

export default observer(() => {
  let context = useContext(GameContext);
  let [done, setDone] = useState(false);

  useMessages({
    touch: (msg) => {
      context.state[msg.player] = msg.tile;
      if (msg.player === context.id) {
        setDone(true);
      }
    }
  });

  const hide = context.me.shutdown;
  const button = done ? <Button>Waiting...</Button>
    : !context.state[context.id] ? <Button>Select the tile you are on</Button>
      : <Button ready onClick={() => touch(context.state[context.id])}>
        Ready
  </Button>;

  return (
    <>
      <TileSet onClick={t => done || (context.state[context.id] = t)} cols={3}>
        <Tile id="floor">None</Tile>
        <Tile id='repair' hide={hide}>Repair</Tile>
        <Tile id='upgrade' hide={hide}>Upgrade</Tile>
        <Tile id='flag' hide={hide}>Flag</Tile>
        <Tile id='pit'>Fell in pit</Tile>
        <Tile id='off'>Off the board</Tile>
      </TileSet>
      {button}
      <Watermark active={context.me.options['Mechanical Arm']}
        img='images/mechanical-arm.svg' text="Mechanical Arm" />
    </>
  );
});
