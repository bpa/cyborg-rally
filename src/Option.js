import { getFile } from './Util';
import React, { Component } from 'react';
import OptionModal from './OptionModal';

export class Option extends Component {
  constructor(props) {
    super(props);
    let o = this.props.card;
    this.file = getFile(o);
    this.state = { showing: false };
    this.done = this.done.bind(this);
    this.show = this.show.bind(this);
  }

  done() {
    this.setState({ showing: false });
  }

  show() {
    this.setState({ showing: true });
  }

  render() {
    let o = this.props.card;
    let modal = this.state.showing
      ? <OptionModal card={o} done={this.done} />
      : null;
    return (
      <span>
        <img src={this.file}
          style={this.props.style}
          onClick={this.show}
          alt={this.props.card.name}
        />
        {modal}
      </span>);
  }
}
