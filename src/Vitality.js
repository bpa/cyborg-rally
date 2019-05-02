import { GameContext } from './Util';
import React, { Component } from 'react';
import { Badge } from './UI';

export default class Vitality extends Component {
  static contextType = GameContext;

  render() {
    const p = this.props.player;
    var life = this.context.opts.lives === 'Inf' ? null : (
      <div>
        <span>Life:</span>
        <Badge bg="green">{p.lives}/{this.context.opts.lives}</Badge>
      </div>
    );

    if (!p.memory) {
      return <div width="16px" />;
    }
    //const dmg = ''.padEnd(p.damage, '♡').padStart(p.memory, '♥');
    //const lives = ''.padEnd(p.lives, '●').padEnd(3, '○');
    return (
      <div style={{ textAlign: 'center' }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Health:</span>
          <Badge mr={0} bg="yellow" color="black">
            {p.memory - p.damage}/{p.memory}
          </Badge>
        </div>
        {life}
      </div>
    )
  }
}
