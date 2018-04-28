import MovementCard from './MovementCard';
import Option from './Option';
import Register from './Register';
import { ButtonCircle, Panel, Shutdown } from 'rebass';
import { Flex, Box } from 'grid-styled';

const RELEVANT_OPTIONS = {
  'Dual Processor': {2: ['r','l'], 3: ['r','l','u']},
  'Crab Legs':      {1: ['r','l']},
};

const VALID = {
  1: { l: true, r: true },
  2: { l: true, r: true },
  3: { l: true, r: true, u: true },
};
const ALL_CARDS = { 1: true, 2: true, 3: true, b: true, u: true, l: true, r: true,
    '1l': true, '1r': true,
    '2l': true, '2r': true,
    '3l': true, '3r': true, '3u': true };

export default class Programming extends React.Component {
    constructor(props) {
        super(props);
        const keys = Object.keys(props.players);
        const cards = gs.private.cards || []
        var reg = gs.private.registers;
        if (!reg) {
          reg = [];
          for (var i=0; i<5; i++) {
            reg.push({damaged:0, program:[]});
          }
          gs.private.registers = reg;
        }
        this.state={
          valid: ALL_CARDS,
          cards: cards.sort((a,b)=>b.priority-a.priority),
          registers: reg.clone(),
        };
        this.ready = this.ready.bind(this);
        this.update_used(this.state.registers);
    }

    on_programming(msg) {
        var cards = [];
        if (msg.cards) {
            cards = msg.cards.sort((a,b)=>b.priority-a.priority);
        }
        gs.private.cards = cards;
        this.used = {};
        this.setState({
            cards: cards,
            registers: msg.registers
        });
    }

    update_used(registers) {
      let used = {}, held = {}, required = 0,
          cards = this.state.cards, remaining = cards.length;
      for (var c of Object.keys(ALL_CARDS)) {
        held[c] = 0;
      }
      for (let c of cards) {
        held[c.name]++;
      }
      for (var r of registers) {
        remaining -= r.program.length;
        if (!r.program) {
          r.name = 'null';
          required++;
        }
        else {
          r.name = r.program.map((p)=>p.name).join('');
        }
        for (var c of r.program) {
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
        gs.private.registers = msg.registers;
        this.update_used(msg.registers);
        this.setState({registers:msg.registers.clone()});
    }

    on_error(msg) {
        this.update_used(gs.private.registers);
        this.setState({registers:gs.private.registers.clone()});
    }

    choose(card) {
      const registers = this.state.registers;
      const reg = registers.map((r)=>r.program);

      if (this.state.register !== undefined) {
        reg[this.state.register][1] = card;
        ws.send({ cmd:'program', registers:reg });
        this.setState({register: undefined, active: undefined, valid: ALL_CARDS});
        return;
      }

      const i = reg.findIndex((r)=>r.length==0);
      if (i>=0) {
        let r = reg[i];
        r[0] = card;
        this.update_used(registers);
        this.setState({registers:registers});
        ws.send({ cmd:'program', registers:reg });
        if (this.state.active && this.state.register === undefined) {
          this.set_register(i);
        }
      }
    }

    activate(option) {
      let valid = {};
      let requirements = RELEVANT_OPTIONS[option];
      for (let k of Object.keys(requirements)) {
        var found = false;
        for (let turn of requirements[k]) {
          found = found || this.held[turn];
        }
        if (found &&
            (this.held[k] || this.state.registers.filter((r)=>r.name==k).length)) {
          valid[k] = true;
        }
      }
      if (Object.keys(valid).length) {
        this.setState({active: option, register: undefined, valid: valid});
      }
    }

    set_register(i) {
      var mv = this.state.registers[i].program[0];
      this.setState({register: i, valid: VALID[mv.name]});
    }

    clear(r) {
        const registers = this.state.registers;
        registers[r].program = [];
        const reg = registers.map((r)=>r.program);
        this.update_used(registers);
        this.setState({registers:registers});
        ws.send({ cmd:'program', registers:reg });
    }

    ready() {
        ws.send({cmd: 'ready'});
    }

    registers() {
      const self = this;
      var options = this.state.registers.map(function(r, i) {
        if (self.state.valid[r.name]) {
          let f = self.state.active ? self.set_register : self.clear;
          return <Register register={r} key={i} onClick={f.bind(self, i)}/>;
        }
        else {
          return <Register register={r} key={i} inactive={true}/>;
        }
      });

      for (var k of Object.keys(RELEVANT_OPTIONS)) {
        var o = this.props.me.options[k];
        if (o) {
          var opt = RELEVANT_OPTIONS[k];
          var inactive=this.remaining < this.required;
          var satisfies = false;
          for (var mv of Object.keys(opt)) {
            var have_turn = false;
            for (var c of opt[mv]) {
              have_turn = have_turn || this.held[c];
            }
            satisfies = satisfies || (have_turn && this.held[mv]);
          }
          inactive = inactive || !satisfies;
          options.push(<button onClick={this.activate.bind(this,k)} key={k}>
              <Option card={o} style={{height:"40px",width:"40px"}}/>
            </button>);
        }
      }
      return options;
    }

    render() {
      let self = this;
      if (this.props.players[gs.id].shutdown) {
          return <Shutdown/>;
      }
      const cards = this.state.cards.map(function(c) {
        if (self.used[c.priority] || !self.state.valid[c.name]) {
          return <MovementCard card={c} key={c.priority} inactive={true}/>;
        }
        else {
          let click = self.choose.bind(self, c);
          return <MovementCard card={c} key={c.priority} onClick={click}/>;
        }
      });

      const registers = this.registers();
      return (
<div>
  <Panel mb={12}>
    <Panel.Header bg="orange">Registers</Panel.Header>
    <Box p={3} mb={12}>{registers}</Box>
  </Panel>
  <Panel mb={12}>
    <Panel.Header bg="blue">Movement Options</Panel.Header>
    <Box p={3} mb={12}>{cards}</Box>
  </Panel>
  <ButtonCircle bg={this.props.me.ready?'red':'green'} onClick={this.ready}>
    {this.props.me.ready?'Not Ready':'Ready'}
  </ButtonCircle>
</div>
    )}
}

