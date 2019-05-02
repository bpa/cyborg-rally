import { ws, GameContext } from './Util';
import React, { Component } from 'react';
import Icon from './Icon';
import { Content, Panel, Shutdown } from './UI';
import { Tile, TileSet } from './TileSet';
import OptionModal from './OptionModal';
import Waiting from './Waiting';

var stabilizer = 'Gyroscopic Stabilizer';

export default class Configuring extends Component {
  constructor(props) {
    super(props);
    this.closeHelp = this.closeHelp.bind(this);
    var options = GameContext.public.player[GameContext.id].options;
    this.state = { cards: GameContext.private.cards, options: options };
    GameContext.state = GameContext.state || {};
    GameContext.state[GameContext.id] = (options[stabilizer] && options[stabilizer].tapped) ? 1 : 0;
  }

  componentWillReceiveProps() {
    var options = GameContext.public.player[GameContext.id].options;
    GameContext.state[GameContext.id] = (options[stabilizer] && options[stabilizer].tapped) ? 1 : 0;
    this.setState({ options: GameContext.public.player[GameContext.id].options });
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
    var options = GameContext.public.player[GameContext.id].options;
    GameContext.state[GameContext.id] = (options[stabilizer] && options[stabilizer].tapped) ? 1 : 0;
    this.setState({ options: GameContext.public.player[GameContext.id].options });
  }

  on_remaining(msg) {
    if (msg.cards) {
      let cards = msg.cards.sort((a, b) => b.priority - a.priority);
      GameContext.private.cards = cards;
      this.setState({ cards: cards });
    }
  }

  render() {
    if (this.props.players[GameContext.id].shutdown) {
      return <Shutdown />
    }

    let controls = [];
    let options = this.state.options;

    if (options['Gyroscopic Stabilizer']) {
      controls.push(
        <Panel background="accent-1" title="Gyroscopic Stabilizer" key="stabilizer"
          onHelp={this.openHelp.bind(this, 'Gyroscopic Stabilizer')}>
          <TileSet onClick={this.stabilize.bind(this)} key="stabilizer">
            <Tile id={1} bg="green">Activate</Tile>
            <Tile id={0} bg="red">Allow board to rotate me</Tile>
          </TileSet>
        </Panel>
      );
    }

    ['Flywheel', 'Conditional Program'].forEach(card => {
      let opt = options[card];
      if (opt) {
        const cards = this.state.cards.map((c) =>
          <Icon card={c} key={c.priority} selected={opt.card && opt.card.priority === c.priority}
            onClick={this.configure.bind(this, card, c)} />
        );

        controls.push(
          <Panel background="accent-2" key={card} title={card}
            onHelp={this.openHelp.bind(this, card)}>
            <Content direction="row" wrap={true}>{cards}</Content>
          </Panel>
        );
      }
    });

    if (controls.length === 0) {
      return <Waiting {...this.props} />;
    }

    let modal = this.state.help && <OptionModal card={this.state.help} done={this.closeHelp} />;

    return (
      <Content>
        {controls}
        {modal}
      </Content>
    );
  }
}

