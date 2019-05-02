import { ws, GameContext, getFile } from './Util';
import React, { Component } from 'react';
import { Button, Panel } from './UI';
import Modal from './Modal';

export default class PendingDamage extends Component {
  static contextType = GameContext;

  constructor(props) {
    super(props);
    this.state = {};
    this.damageRobot = this.damageRobot.bind(this);
    this.reset = this.reset.bind(this);
    this.discard = this.discard.bind(this);
  }

  select(option) {
    this.setState({ selected: option });
  }

  damageRobot() {
    this.setState({ selected: 'robot' });
  }

  discard() {
    ws.send({ cmd: 'damage', target: this.state.selected });
    this.reset();
  }

  reset() {
    this.setState({ selected: undefined });
  }

  choice(options, option) {
    let src = getFile(options[option]);
    return (
      <div key={option} onClick={this.select.bind(this, option)}
        style={{
          height: '48px', width: '48px',
          padding: '8px', margin: '8px 4px 0px 4px',
          border: '2px solid green', borderRadius: '8px',
        }}>
        <img src={src} style={{ height: '100%' }} alt={option} />
      </div>
    );
  }

  render_discard() {
    let options = this.context.me.options;
    let keys = Object.keys(options || {});
    let available = keys.map(this.choice.bind(this, options));
    return (
      <Modal title="Damage Pending" closeText="Have Robot Take Damage" close={this.damageRobot}>
        <Panel color="accent-2" title="Discard Option">
          {available}
        </Panel>
      </Modal>);
  }

  render_robot() {
    return (
      <Modal title="Damage Pending" close={this.reset} closeText="Nevermind">
        Are you sure you want to damage your robot?
        <Button onClick={this.discard}>Yes, damage my robot</Button>
      </Modal>);
  }

  render_confirm() {
    return (
      <Modal title="Damage Pending" close={this.reset} closeText="Nevermind">
        Are you sure you want to discard {this.state.selected}?
        <Button onClick={this.discard}>Yes, discard option</Button>
      </Modal>);
  }

  render() {
    if (!(this.context.pending_damage && this.context.pending_damage[this.context.id])) {
      return null;
    }
    if (this.state.selected === undefined) {
      return this.render_discard();
    }
    if (this.state.selected === 'robot') {
      return this.render_robot();
    }
    return this.render_confirm();
  }
}

