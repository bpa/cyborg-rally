import { ws, GameContext } from './Util';
import React from 'react';
import ConfirmOption from './ConfirmOption';
import ConfirmShot from './ConfirmShot';
import Deny from './Deny';
import Dispute from './Dispute';
import OptionPanel from './OptionPanel';
import Ready from './Ready';
import Player from './Player';
import { Button, Shutdown, Content } from './UI';
import DamageHandler from './DamageHandler';

export default class Movement extends DamageHandler {
  static contextType = GameContext;

  constructor(props) {
    super(props);
    this.state = { order: [], active: false, denied: [] };
  }

  componentDidMount() {
    this.setState({ order: this.context.state.order || [] });
  }

  activate(option) {
    if (option === 'Abort Switch') {
      this.setState({
        confirm: {
          name: option,
          message: <span>This register and all remaining registers will be replaced.</span>,
          action: () => ws.send({ cmd: 'abort' }),
        }
      });
    }
    if (option === 'Ramming Gear') {
      this.setState({ active: option });
    }
  }

  deactivate(option) {
    this.setState({ active: undefined });
  }

  confirm_ram() {
    this.state.confirm.action();
    this.setState({ confirm: undefined });
  }

  on_confirm(msg) {
    let pending = this.state.pending_shots;
    pending.remove((p) => p.player === msg.player);
    this.setState({ pending_shots: pending });
  }

  cancel() {
    this.setState({ confirm: undefined });
  }

  on_move(msg) {
    this.setState({ order: msg.order });
  }

  ram(player) {
    ws.send({ cmd: 'ram', target: player })
  }

  on_ram(msg) {
    var pending = this.state.pending_shots;
    pending.push({ player: msg.player, type: 'Ramming Gear' });
    this.setState({ pending_shots: pending })
  }

  icon(name) {
    return (
      <svg viewBox="0 0 100 100" style={{ color: 'red', width: "0.75em" }}>
        <g fill="currentColor" stroke="currentColor">
          <use href={"#" + name} />
        </g>
      </svg>
    );
  }

  players() {
    var player = this.props.players;
    const keys = Object.keys(player).sort().filter(
      (p) => p !== GameContext.id && !player[p].dead
    );
    return keys.map((id) => {
      const p = player[id];
      if (this.props.me.ready) {
        return <Player player={p} key={id} />
      } else {
        return (
          <Button key={id} bg='black' color="red" onClick={this.ram.bind(this, id)}>
            <div>{this.icon("sight")} {p.name} {this.icon("sight")}</div>
          </Button>)
      }
    })
  }

  render() {
    const players = this.context.public.player;
    if (this.context.me.shutdown) {
      return <Shutdown />
    }

    var pending = this.context.pending_shots && this.context.pending_shots.map((s) => (
      <ConfirmShot player={this.context.me} shot={s} key={s.player}
        confirm={this.confirm.bind(this, s)}
        deny={this.deny.bind(this, s)} />
    ));

    var disputed = this.context.disputed && this.context.disputed.map((d) => (
      <Dispute shot={d} key={d.player} vote={this.vote.bind(this, d)} />
    ));

    return (
      <Content>
        <OptionPanel notify={this}>
          <o name='Abort Switch' />
          <o name='Ramming Gear' />
        </OptionPanel>
        <Ready />
        <hr />
        {this.state.active === 'Ramming Gear' ? this.players()
          : this.state.order.map((o) =>
            <Player player={players[o.player]} key={o.player} register={o} />)
        }
        {this.state.denied.map((d) => (
          <Deny type={d.type} target={d.player} key={d.player}
            close={this.acceptDeny.bind(this, d)}
            escalate={this.escalate.bind(this, d)} />))}
        <ConfirmOption option={this.state.confirm}
          onConfirm={this.confirm_ram} onCancel={this.cancel} />
        {pending}
        {disputed}
      </Content>
    )
  }
}
