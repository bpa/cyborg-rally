import { ws, GameContext } from './Util';
import React, { Component } from 'react';
import { Shutdown } from './UI';
import { Tile, TileSet } from './TileSet';

export default class Announcing extends Component {
  shutdown(activate) {
    ws.send({ cmd: 'shutdown', activate: activate });
  }

  render() {
    if (this.props.players[GameContext.id].shutdown) {
      return <Shutdown />
    }
    return (
      <TileSet onClick={this.shutdown.bind(this)}>
        <Tile id={false} bg="green">Stay in</Tile>
        <Tile id={true} bg="red">Shutdown</Tile>
      </TileSet>
    );
  }
}

