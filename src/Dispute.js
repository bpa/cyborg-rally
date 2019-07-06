import { GameContext, LASER_OPTION } from './Util';
import React, { useContext } from 'react';
import { Button } from './UI';
import Modal from './Modal';
import { Option } from './Option';
import { Badge } from './UI';

export default function Dispute(props) {
  let context = useContext(GameContext);
  let shot = props.shot;
  let player = context.public.player[shot.player];
  let target = context.public.player[shot.target];
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
    <Modal title={title} closeText="No" close={props.vote.bind(null, false)}>
      <span style={{ paddingTop: '8px', margin: 'auto' }}>
        Did {player.name} {action} {target.name} with a {shot.type}?
        </span>
      <Button onClick={props.vote.bind(null, true)} bg="green">
        Yes
        </Button>
    </Modal>);
}
