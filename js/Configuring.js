import Icon from './Icon';
import { Content, Shutdown } from './Widgets';
import { Tile, TileSet } from './TileSet';
import OptionModal from './OptionModal';
import { Circle, Panel } from 'rebass';
import Waiting from './Waiting';

var stabilizer = 'Gyroscopic Stabilizer';

export default class Configuring extends React.Component {
  constructor(props) {
    super(props);
    this.closeHelp = this.closeHelp.bind(this);
    var options = gs.public.player[gs.id].options;
    this.state = { cards: gs.private.cards, options: options };
    gs.state = gs.state || {};
    gs.state[gs.id] = (options[stabilizer] && options[stabilizer].tapped) ? 1 : 0;
  }

  componentWillReceiveProps() {
    var options = gs.public.player[gs.id].options;
    gs.state[gs.id] = (options[stabilizer] && options[stabilizer].tapped) ? 1 : 0;
    this.setState({ options: gs.public.player[gs.id].options });
  }

  openHelp(option) {
    this.setState({ help: this.state.options[option] });
  }

  closeHelp() {
    this.setState({ help: undefined });
  }

  stabilize(activate) {
    ws.send({ cmd: 'configure', option: 'Gyroscopic Stabilizer', activate: activate });
  }

  configure(option, card) {
    ws.send({ cmd: 'configure', option: option, card: card });
  }

  on_options(msg) {
    var options = gs.public.player[gs.id].options;
    gs.state[gs.id] = (options[stabilizer] && options[stabilizer].tapped) ? 1 : 0;
    this.setState({ options: gs.public.player[gs.id].options });
  }

  on_remaining(msg) {
    if (msg.cards) {
      let cards = msg.cards.sort((a, b) => b.priority - a.priority);
      gs.private.cards = cards;
      this.setState({ cards: cards });
    }
  }

  render() {
    if (this.props.players[gs.id].shutdown) {
      return <Shutdown />
    }

    let controls = [];
    let options = this.state.options;

    if (options['Gyroscopic Stabilizer']) {
      controls.push(
        <Panel mt={2} key="stabilizer">
          <Panel.Header bg="cyan">
            Gyroscopic Stabilizer
            <span style={{ position: 'absolute', right: '' }}>
              <Circle onClick={this.openHelp.bind(this, 'Gyroscopic Stabilizer')}>?</Circle>
            </span>
          </Panel.Header>
          <TileSet onClick={this.stabilize.bind(this)} key="stabilizer">
            <Tile id={1} bg="green">Activate</Tile>
            <Tile id={0} bg="red">Allow board to rotate me</Tile>
          </TileSet>
        </Panel>
      );
    }

    ['Flywheel', 'Conditional Program'].map(card => {
      let opt = options[card];
      if (opt) {
        const cards = this.state.cards.map((c) =>
          <Icon card={c} key={c.priority} selected={opt.card && opt.card.priority === c.priority}
            onClick={this.configure.bind(this, card, c)} />
        );

        controls.push(
          <Panel mt={2} key={card}>
            <Panel.Header bg="cyan">
              {card}
              <span style={{ position: 'absolute', right: '' }}>
                <Circle onClick={this.openHelp.bind(this, card)}>?</Circle>
              </span>
            </Panel.Header>
            <Content flexDirection="row" flexWrap="wrap">{cards}</Content>
          </Panel>
        );
      }
    });

    if (controls.length === 0) {
      return <Waiting {...this.props} />;
    }

    let modal = this.state.help !== undefined
      ? <OptionModal card={this.state.help} done={this.closeHelp} />
      : null;

    return (<div>
      {controls}
      {modal}
    </div>);
  }
}

