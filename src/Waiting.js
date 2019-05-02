import { GameContext } from './Util';
import React, { Component } from 'react';
import Ready from './Ready';
import Players from './Players';
import { Content } from './UI';
import Watermark from './Watermark';

export default class Waiting extends Component {
  static contextType = GameContext;

  gyroscopic_stabilizer() {
    let state = this.context.public.state;
    let options = this.context.me.options || {};
    let stabilizer = options['Gyroscopic Stabilizer'];
    if ((state.includes('conveyor') || state === "gears") &&
      stabilizer !== undefined && stabilizer.tapped) {
      return <Watermark active={true} img='images/gyroscopic-stabilizer.svg' text="Gyroscopic Stabilizer" />
    }
    return null;
  }

  render() {
    return (
      <Content>
        <Ready />
        <hr />
        <Players />
        {this.gyroscopic_stabilizer()}
      </Content>
    )
  }
}
