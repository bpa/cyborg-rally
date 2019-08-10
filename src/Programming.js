import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from './Icon';
import Modal from './Modal';
import OptionPanel from './OptionPanel';
import Register from './Register';
import { Button, Content, Panel, Shutdown } from './UI';

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

export default observer(props => {
  let context = useContext(GameContext);

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

    r.program.push(card);
    let reg = context.private.registers.map(r => r.program);
    ws.send({ cmd: 'program', registers: reg });
  }

  function clear(r) {
    context.private.registers[r].program = [];
    setActive(false);
    setRegister(undefined);
    const reg = context.private.registers.map((r) => r.program);
    ws.send({ cmd: 'program', registers: reg });
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

    program: (msg) => {
      context.private.registers = msg.registers;
    },

    // error: (msg) => setRegisters(context.private.registers.clone()),
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
      <Button bg={context.me.ready ? 'red' : 'green'} onClick={() => ws.send({ cmd: 'ready' })}>
        {context.me.ready ? 'Not Ready' : 'Ready'}
      </Button>
      {recompile}
    </Content >
  );
});
