import { ws, GameContext } from './Util';
import React, { useContext } from 'react';
import { Tile, TileSet } from './TileSet';
import Watermark from './Watermark';

export default function Touching(props) {
  let context = useContext(GameContext);
  // let [tiles, setTiles] = useState(context.state, {});

  // useMessages({
  //   touch: (msg) => {
  //     setTiles(tiles => {
  //       tiles[msg.player] = msg.tile;
  //       return tiles;
  //     });
  //   }
  // });

  function touch(tile) {
    ws.send({ cmd: 'touch', tile: tile });
  }

  const hide = context.me.shutdown;
  return (
    <>
      <TileSet onClick={touch}>
        <Tile id="floor">None</Tile>
        <Tile id='repair' hide={hide}>Repair</Tile>
        <Tile id='upgrade' hide={hide}>Upgrade</Tile>
        <Tile id='flag' hide={hide}>Flag</Tile>
        <Tile id='pit'>Fell in pit</Tile>
        <Tile id='off'>Off the board</Tile>
      </TileSet>
      <Watermark active={context.me.options['Mechanical Arm']}
        img='images/mechanical-arm.svg' text="Mechanical Arm" />
    </>
  );
}
