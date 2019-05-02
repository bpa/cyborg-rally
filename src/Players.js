import React, { Component } from 'react';
import Player from './Player';
import { Box } from './UI';
import { GameContext } from './Util';

export default class Players extends Component {
  static contextType = GameContext;

  render() {
    console.log(this.context);
    const players = this.context.public.player;
    const alive = Object.keys(players).filter((p) => !players[p].dead);
    return (
      <Box gap="small">
        {alive.sort().map((id) => <Player {...this.props} player={players[id]} key={id} />)}
      </Box>
    );
  }
}
