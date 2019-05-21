import { ws, GameContext } from './Util';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Shutdown } from './UI';
import { Tile, TileSet } from './TileSet';

function shutdown(activate) {
  ws.send({ cmd: 'shutdown', activate: activate });
}

export default observer(props => {
  let context = useContext(GameContext);
  if (context.me.shutdown) {
    return <Shutdown />
  }
  return (
    <TileSet onClick={shutdown}>
      <Tile id={false} bg="green">Stay in</Tile>
      <Tile id={true} bg="red">Shutdown</Tile>
    </TileSet>
  );
});

