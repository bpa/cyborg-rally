import { GameContext, LASER_OPTION } from './Util';
import React, { Component } from 'react';
import { Button } from './UI';
import Modal from './Modal';
import { Option } from './Option';
import { Badge } from './UI';

export default class Dispute extends Component {
  render() {
    let shot = this.props.shot;
    let player = GameContext.public.player[shot.player];
    let target = GameContext.public.player[shot.target];
    let card = player['options'][shot.type];
    if (card === undefined) {
      card = LASER_OPTION;
    }
    let type = shot.type === 'Ramming Gear' ? 'contact' : 'shot';
    let action = shot.type === 'Ramming Gear' ? 'ram' : 'shoot';
    let title =
      <div>
        <Badge bg="blue">
          <Option card={card} style={{ height: '2em' }} />
        </Badge>
        <span style={{ margin: 'auto' }}>
          Disputed {type}
        </span>
      </div>;
    return (
      <Modal title={title} closeText="No" close={this.props.vote.bind(null, false)}>
        <span style={{ paddingTop: '8px', margin: 'auto' }}>
          Did {player.name} {action} {target.name} with a {shot.type}?
        </span>
        <Button onClick={this.props.vote.bind(null, true)} bg="green">
          Yes
        </Button>
      </Modal>);
  }
}

