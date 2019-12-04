import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Player from './Player';
import { Box } from './UI';
import { GameContext } from './Util';

export default observer(props => {
  let context = useContext(GameContext);
  const players = context.public.player;

  console.log(JSON.parse(JSON.stringify(context.state)));
  const show = Object.keys(players)
    .sort()
    .filter(id => {
      let player = players[id];
      if (player.dead) {
        return false;
      }
      if (props.filter) {
        return props.filter(id);
      }
      return true;
    });

  return (
    <Box gap="small">
      {show.sort().map(id => <Player {...props} player={players[id]} key={id} />)}
    </Box>
  );
});
