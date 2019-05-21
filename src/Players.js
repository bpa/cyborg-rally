import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Player from './Player';
import { Box } from './UI';
import { GameContext } from './Util';

export default observer(props => {
  let context = useContext(GameContext);
  const players = context.public.player;
  const alive = Object.keys(players).filter((p) => !players[p].dead);
  return (
    <Box gap="small">
      {alive.sort().map((id) => <Player {...props} player={players[id]} key={id} />)}
    </Box>
  );
});
