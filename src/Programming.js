import { ws, GameContext } from './Util';
import React from 'react';
import Icon from './Icon';
import Modal from './Modal';
import OptionPanel from './OptionPanel';
import Register from './Register';
import { Button, Content, Panel, Shutdown } from './UI';
import RegisteredComponent from './RegisteredComponent';

const RELEVANT_OPTIONS = {
  'Dual Processor': { 2: ['r', 'l'], 3: ['r', 'l', 'u'] },
  'Crab Legs': { 1: ['r', 'l'] },
};

const VALID = {
  1: { l: true, r: true },
  2: { l: true, r: true },
  3: { l: true, r: true, u: true },
};

const ALL_CARDS = {
  1: true, 2: true, 3: true, b: true, u: true, l: true, r: true,
  '1l': true, '1r': true,
  '2l': true, '2r': true,
  '3l': true, '3r': true, '3u': true
};

export default class Programming extends RegisteredComponent {
  constructor(props) {
    super(props);
    const cards = GameContext.private.cards || []
    var reg = GameContext.private.registers;
    if (!reg) {
      reg = [];
      for (var i = 0; i < 5; i++) {
        reg.push({ locked: 0, program: [] });
      }
      GameContext.private.registers = reg;
    }
    if (GameContext.state === undefined) {
      GameContext.state = {};
    }
    this.state = {
      valid: ALL_CARDS,
      cards: cards.sort((a, b) => b.priority - a.priority),
      registers: reg.clone(),
    };
    this.ready = this.ready.bind(this);
    this.cancel_recompile = this.cancel_recompile.bind(this);
    this.update_used(this.state.registers);
  }

  on_programming(msg) {
    var cards = [];
    if (msg.cards) {
      cards = msg.cards.sort((a, b) => b.priority - a.priority);
    }
    GameContext.private.cards = cards;
    GameContext.state = { recompiled: msg.recompiled };
    this.used = {};
    this.setState({
      cards: cards,
      registers: msg.registers
    });
  }

  update_used(registers) {
    let used = {}, held = {}, required = 0,
      cards = this.state.cards, remaining = cards.length;
    for (let c of Object.keys(ALL_CARDS)) {
      held[c] = 0;
    }
    for (let c of cards) {
      held[c.name]++;
    }
    for (let r of registers) {
      remaining -= r.program.length;
      if (!r.program) {
        r.name = 'null';
        required++;
      }
      else {
        r.name = r.program.map((p) => p.name).join('');
      }
      for (let c of r.program) {
        used[c.priority] = true;
        held[c.name]--;
      }
    }
    this.used = used;
    this.held = held;
    this.remaining = remaining;
    this.required = required;
  }

  on_program(msg) {
    GameContext.private.registers = msg.registers;
    this.update_used(msg.registers);
    this.setState({ registers: msg.registers.clone() });
  }

  on_error(msg) {
    this.update_used(GameContext.private.registers);
    this.setState({ registers: GameContext.private.registers.clone() });
  }

  choose(card) {
    const registers = this.state.registers;
    const reg = registers.map((r) => r.program);

    if (this.state.register !== undefined) {
      reg[this.state.register][1] = card;
      ws.send({ cmd: 'program', registers: reg });
      this.setState({ register: undefined, active: undefined, valid: ALL_CARDS });
      return;
    }

    const i = reg.findIndex((r) => r.length === 0);
    if (i >= 0) {
      let r = reg[i];
      r[0] = card;
      this.update_used(registers);
      this.setState({ registers: registers });
      ws.send({ cmd: 'program', registers: reg });
      if (this.state.active && this.state.register === undefined) {
        this.set_register(i);
      }
    }
  }

  activate(option) {
    if (option === 'Recompile') {
      this.setState({ confirm_recompile: true });
    }
    else {
      this.combine(option);
    }
  }

  deactivate(option) {
    this.setState({ register: undefined, active: undefined, valid: ALL_CARDS });
  }

  combine(option) {
    let valid = {};
    let requirements = RELEVANT_OPTIONS[option];
    for (let k of Object.keys(requirements)) {
      var found = false;
      for (let turn of requirements[k]) {
        found = found || this.held[turn];
      }
      if (found &&
        (this.held[k] || this.state.registers.filter((r) => r.name === k).length)) {
        valid[k] = true;
      }
    }
    if (Object.keys(valid).length) {
      this.setState({ active: option, register: undefined, valid: valid });
    }
  }

  set_register(i) {
    var mv = this.state.registers[i].program[0];
    this.setState({ register: i, valid: VALID[mv.name] });
  }

  clear(r) {
    const registers = this.state.registers;
    registers[r].program = [];
    const reg = registers.map((r) => r.program);
    this.update_used(registers);
    this.setState({ registers: registers });
    ws.send({ cmd: 'program', registers: reg });
  }

  ready() {
    ws.send({ cmd: 'ready' });
  }

  recompile() {
    ws.send({ cmd: 'recompile' });
    this.setState({ confirm_recompile: false });
  }

  cancel_recompile() {
    this.setState({ confirm_recompile: false });
  }

  confirm_recompile() {
    let imgStyle = {
      width: '60px',
      height: '60px',
      margin: '5px',
      backgroundColor: 'green',
      borderRadius: 6,
      overflow: 'hidden',
      float: 'left',
    };
    return this.state.confirm_recompile ? (
      <Modal title="Confirm Recompile" closeText="Cancel" close={this.cancel_recompile}>
        <div style={imgStyle}>
          <img src="images/recompile.svg" style={{ width: '100%' }} alt="Recompile" />
        </div>
        <span style={{ color: 'black' }}>
          Are you sure?<br />
          You will take 1 damage and get new cards.
        </span>
        <Button onClick={this.recompile.bind(this)} bg="green">
          Yes
        </Button>
      </Modal>)
      : null;
  }

  registers() {
    const self = this;
    var moves = this.state.registers.map(function (r, i) {
      if (self.state.valid[r.name]) {
        let f = self.state.active ? self.set_register : self.clear;
        return <Register register={r} key={"register" + i} onClick={f.bind(self, i)} />;
      }
      else {
        return <Register register={r} key={"register" + i} inactive={true} />;
      }
    });
    return moves;
  }

  render() {
    let self = this;
    if (this.props.players[GameContext.id].shutdown) {
      return <Shutdown />;
    }
    const cards = this.state.cards.map(function (c) {
      if (self.used[c.priority] || !self.state.valid[c.name]) {
        return <Icon card={c} key={c.priority} className="inactive" />;
      }
      else {
        let click = self.choose.bind(self, c);
        return <Icon card={c} key={c.priority} onClick={click} />;
      }
    });

    return (
      <Content>
        <OptionPanel me={this.props.me} notify={this} active={this.state.active}>
          <o name='Dual Processor' />
          <o name='Crab Legs' />
          <o name='Recompile' />
        </OptionPanel>
        <Panel background="accent-1" title="Registers" direction="row">
          {this.registers()}
        </Panel>
        <Panel background="accent-2" title="Movement Cards" direction="row">
          {cards}
        </Panel>
        <Button bg={this.props.me.ready ? 'red' : 'green'} onClick={this.ready}>
          {this.props.me.ready ? 'Not Ready' : 'Ready'}
        </Button>
        {this.confirm_recompile()}
      </Content >
    );
  }
}

