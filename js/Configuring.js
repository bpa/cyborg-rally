import Icon from './Icon';
import { Content, Shutdown } from './Widgets';
import { Tile, TileSet} from './TileSet';
import { Panel } from 'rebass';
import Waiting from './Waiting';

export default class Configuring extends React.Component {
  constructor(props) {
    super(props);
    this.state = {cards: gs.private.cards};
  }

  stabilize(activate) {
    ws.send({cmd: 'stabilizer', activate: activate});
  }

  flywheel(card) {
    ws.send({cmd: 'flywheel', card: card});
  }

  on_remaining(msg) {
    if (msg.cards) {
      let cards = msg.cards.sort((a,b)=>b.priority-a.priority);
      gs.private.cards = cards;
      this.setState({ cards: cards });
    }
  }

  render() {
    if (this.props.players[gs.id].shutdown) {
      return <Shutdown/>
    }

    let controls = [];
    let options = this.props.players[gs.id].options;

    if (options['Gyroscopic Stabilizer']) {
      controls.push(
        <Panel mt={2} key="stabilizer">
          <Panel.Header bg="cyan">Gyroscopic Stabilizer</Panel.Header>
          <TileSet onClick={this.stabilize.bind(this)} key="stabilizer">
            <Tile id={true} bg="green">Activate</Tile>
            <Tile id={false} bg="red">Allow board to rotate me</Tile>
          </TileSet>
        </Panel>
      );
    }

    if (options['Flywheel']) {
      const cards = this.state.cards.map((c) =>
          <Icon card={c} key={c.priority}
            onClick={this.flywheel.bind(this, c)}/>
      );

      controls.push(
        <Panel mt={2} key="flywheel">
          <Panel.Header bg="cyan">Flywheel</Panel.Header>
          <Content flexDirection="row" flexWrap="wrap">{cards}</Content>
        </Panel>
      );
    }

    if (controls.length === 0) {
      return <Waiting {...this.props}/>;
    }

    return <div>{controls}</div>;
  }
}

