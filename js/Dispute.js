import { Button } from './Widgets';
import Modal from './Modal';
import { Option } from './Option';
import { Flex } from 'grid-styled';
import { Badge } from 'rebass';

export default class Dispute extends React.Component {
  render() {
    let shot = this.props.shot;
    let player = gs.public.player[shot.player];
    let target = gs.public.player[shot.target];
    let card = player['options'][shot.type];
    if (card === undefined) {
      card = LASER_OPTION;
    }
    let type = shot.type === 'Ramming Gear' ? 'contact' : 'shot';
    let action = shot.type === 'Ramming Gear' ? 'ram' : 'shoot';
    let title =
      <Flex>
        <Badge bg="blue">
          <Option card={card} style={{ height: '2em' }} />
        </Badge>
        <span style={{ margin: 'auto' }}>
          Disputed {type}
        </span>
      </Flex>;
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

