import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useState, useReducer } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from './Icon';
import Modal from './Modal';
import OptionPanel from './OptionPanel';
import Register from './Register';
import { Button, Content, Panel, Shutdown } from './UI';
import { toJS } from 'mobx';

const RELEVANT_OPTIONS = {
  'Dual Processor': { 2: { r: true, l: true }, 3: { r: true, l: true, u: true } },
  'Crab Legs': { 1: { r: true, l: true } },
};

const ALL_CARDS = {
  1: true, 2: true, 3: true, b: true, u: true, l: true, r: true,
  '1l': true, '1r': true,
  '2l': true, '2r': true,
  '3l': true, '3r': true, '3u': true,
};

function matches(server, client) {
  for (var r = 0; r < 5; r++) {
    let programA = server[r].program, programB = client[r].program;
    if (programA.length !== programB.length) {
      return false;
    }
    for (var i = 0; i < programA.length; i++) {
      if (programA[i].priority !== programB[i].priority) {
        return false;
      }
    }
  }
  return true;
}

function stackIndex(registers, stack) {
  for (var i = stack.length - 1; i >= 0; i--) {
    if (matches(registers, stack[i])) {
      return i;
    }
  }
  return -1;
}

// I'm not super happy with this, but I can't really think of anything better
// Side effects: ws calls and modifying context
function programmer(state, action) {
  let notify = false;
  let { stack, context } = state;
  switch (action.cmd) {
    case 'error':
      let last = state.stack.pop();
      if (last) {
        context.private.registers = last;
      }
      break;

    case 'clear':
      stack.push(toJS(context.private.registers));
      context.private.registers[action.register].program = [];
      notify = true;
      break;

    case 'program':
      let registers = action.registers;
      if (matches(registers, context.private.registers)) {
        state.stack = [];
        break;
      }

      let ind = stackIndex(registers, stack);
      if (ind !== -1) {
        state.stack = stack.slice(ind + 1);
        break;
      }

      context.private.registers = action.registers;
      state.stack = [];
      break;

    default:
      stack.push(toJS(context.private.registers));
      action.register.program.push(action.card);
      notify = true;
  }

  if (notify) {
    let reg = context.private.registers.map(r => r.program);
    ws.send({ cmd: 'program', registers: reg });
  }

  return state;
}

export default observer(props => {
  let context = useContext(GameContext);

  let [, program] = useReducer(programmer, { context: context, stack: [] });
  let [active, setActive] = useState(false);
  let [register, setRegister] = useState(undefined);
  let [cards, setCards] = useState(() => {
    if (context.private.cards) {
      let cards = context.private.cards ? context.private.cards.slice() : [];
      return cards.sort((a, b) => b.priority - a.priority);
    }
    return [];
  });

  if (!context.private.registers) {
    let reg = [];
    for (var i = 0; i < 5; i++) {
      reg.push({ program: [] });
    }
    context.private.registers = reg;
  }

  let used = {};
  for (var r of context.private.registers) {
    for (var p of r.program) {
      used[p.priority] = true;
    }
  }

  var valid;
  if (active) {
    const activeCard = register === undefined ? false : context.private.registers[register].program.reduce((n, c) => n + c.name, '');
    if (activeCard) {
      valid = RELEVANT_OPTIONS[active][activeCard];
    }
    else {
      let available = {};
      for (var c of cards) {
        if (!used[c.priority]) {
          available[c.name] = true;
        }
      }
      valid = {};
      let optionCards = RELEVANT_OPTIONS[active];
      for (c in optionCards) {
        for (var req in optionCards[c]) {
          if (available[req]) {
            valid[c] = true;
          }
        }
      }
    }
  } else {
    valid = ALL_CARDS;
  }

  function choose(card) {
    const i = register !== undefined ? register : context.private.registers.findIndex((r) => r.program.length === 0);
    if (i === -1) {
      return;
    }

    let r = context.private.registers[i];
    if (r.program.length) {
      setActive(false);
      setRegister(undefined);
    } else {
      if (active) {
        setRegister(i);
      }
    }

    program({ register: r, card: card });
  }

  function clear(r) {
    setActive(false);
    setRegister(undefined);
    program({ cmd: 'clear', register: r });
  }

  useMessages({
    programming: (msg) => {
      var heldCards = [];
      if (msg.cards) {
        heldCards = msg.cards.sort((a, b) => b.priority - a.priority);
      }
      context.private.cards = heldCards;
      setCards(heldCards);
      context.private.registers = msg.registers;
    },

    program: (msg) => program(msg),
    error: (msg) => program(msg),
  });

  let imgStyle = {
    width: '60px',
    height: '60px',
    margin: '5px',
    backgroundColor: 'green',
    borderRadius: 6,
    overflow: 'hidden',
    float: 'left',
  };

  let recompile = active === 'Recompile' ? (
    <Modal title="Confirm Recompile" closeText="Cancel" close={() => setActive(undefined)}>
      <div style={imgStyle}>
        <img src="images/recompile.svg" style={{ width: '100%' }} alt="Recompile" />
      </div>
      <span style={{ color: 'black' }}>
        Are you sure?<br />
        You will take 1 damage and get new cards.
          </span>
      <Button onClick={() => {
        ws.send({ cmd: 'recompile' });
        setActive(undefined);
      }}>
        Yes
      </Button>
    </Modal>)
    : null;

  if (context.me.shutdown) {
    return <Shutdown />;
  }

  var registerObjs = context.private.registers.map(function (r, i) {
    var className = 'inactive', f = undefined;
    if (register === i) {
      className = 'add-on';
      f = clear;
    } else if (valid[r.program.reduce((n, c) => n + c.name, '')]) {
      className = '';
      f = active ? setRegister : clear;
    }

    return <Register register={r} key={"register" + i} onClick={f ? () => f(i) : undefined} className={className} />;
  });

  const movementCards = cards.map(function (c) {
    if (used[c.priority] || !valid[c.name]) {
      return <Icon card={c} key={c.priority} className="inactive" />;
    }
    else {
      return <Icon card={c} key={c.priority} onClick={() => choose(c)} />;
    }
  });

  let ready = context.me.ready
    ? <Button target>Waiting...</Button>
    : <Button ready onClick={() => ws.send({ cmd: 'ready' })}>Ready</Button>;

  return (
    <Content>
      <OptionPanel active={active} setActive={(o) => { setActive(o); setRegister(undefined) }}>
        <o name='Dual Processor' />
        <o name='Crab Legs' />
        <o name='Recompile' />
      </OptionPanel>
      <Panel background="accent-1" title="Registers" direction="row">
        {registerObjs}
      </Panel>
      <Panel background="accent-2" title="Movement Cards" direction="row">
        {movementCards}
      </Panel>
      {ready}
      {recompile}
    </Content >
  );
});
