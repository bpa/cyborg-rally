import { GameContext, LASER_OPTION } from './Util';
import React, { Component } from 'react';
import OptionCards from './OptionCards';
import OptionModal from './OptionModal';
import { Panel } from './UI';

export default class OptionPanel extends Component {
  static contextType = GameContext;

  constructor(props) {
    super(props);
    this.state = {
      showHelp: false,
      openHelp: this.openHelp.bind(this),
    };
    this.closeHelp = this.closeHelp.bind(this);
  }

  openHelp(option) {
    this.setState({ show: option, showHelp: false });
  }

  closeHelp() {
    this.setState({ show: undefined });
  }

  toggleHelp() {
    let show = !this.state.showHelp;
    this.setState({ showHelp: show });
  }

  render() {
    let held = [];
    let props = this.props;
    let children = props.children;
    if (!Array.isArray(children)) {
      children = [children];
    }
    for (var o of children) {
      let element = OptionCards[o.props.name].render(props, this.state, this.context.me);
      if (element !== null) {
        held.push(element);
      }
    }

    if (held.length < (props.min || 1)) {
      return null;
    }

    let card = this.state.show === 'laser'
      ? LASER_OPTION
      : GameContext.public.player[GameContext.id].options[this.state.show];

    let modal = card && <OptionModal card={card} done={this.closeHelp} />;

    return (
      <Panel background="neutral-3" title="Option Cards" onHelp={this.toggleHelp.bind(this)}>
        {held}
        {modal}
      </Panel>
    );
  }
}
