import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from './Icon';
import Modal from './Modal';
import OptionPanel from './OptionPanel';
import Register from './Register';
import { Button, Content, Panel, Shutdown } from './UI';

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

export default observer(props => {
  let context = useContext(GameContext);

  let [active, setActive] = useState(false);
  let [registers, setRegisters] = useState(() => {
    var reg = context.private.registers;
    if (reg) {
      return reg;
    } else {
      reg = [];
      for (var i = 0; i < 5; i++) {
        reg.push({ locked: 0, program: [] });
      }
      return reg;
    }
  });

  let [valid, setValid] = useState(ALL_CARDS);

  let [held, setHeld] = useState({});
  let [used, setUsed] = useState({});

  let [cards, setCards] = useState(() => {
    let cards = context.private.cards ? context.private.cards.slice() : [];
    return cards.sort((a, b) => b.priority - a.priority);
  });
  let [confirmRecompile, setConfirmRecompile] = useState(false);
  let [register, setRegister] = useState(undefined);

  useEffect(() => program.update_used(registers), []);
  let program = {
    update_used: (registers) => {
      let upd_used = {};
      let upd_held = {};

      for (let c of Object.keys(ALL_CARDS)) {
        upd_held[c] = 0;
      }
      for (let c of cards) {
        upd_held[c.name]++;
      }
      for (let r of registers) {
        if (!r.program) {
          r.name = 'null';
        }
        else {
          r.name = r.program.map((p) => p.name).join('');
        }
        for (let c of r.program) {
          upd_used[c.priority] = true;
          upd_held[c.name]--;
        }
      }
      setUsed(upd_used);
      setHeld(upd_held);
    },

    choose: (card) => {
      const reg = registers.map((r) => r.program);

      if (register !== undefined) {
        reg[register][1] = card;
        ws.send({ cmd: 'program', registers: reg });
        program.deactivate();
        return;
      }

      const i = reg.findIndex((r) => r.length === 0);
      if (i >= 0) {
        let r = reg[i];
        r[0] = card;
        program.update_used(registers);
        setRegisters(registers);
        ws.send({ cmd: 'program', registers: reg });
        if (active && register === undefined) {
          program.set_register(i);
        }
      }
    },

    activate: (option) => {
      if (option === 'Recompile') {
        setConfirmRecompile(true);
      }
      else {
        program.combine(option);
      }
    },

    deactivate: (option) => {
      setRegisters(undefined);
      setActive(undefined);
      setValid(ALL_CARDS);
    },

    combine: (option) => {
      let valid = {};
      let requirements = RELEVANT_OPTIONS[option];
      for (let k of Object.keys(requirements)) {
        var found = false;
        for (let turn of requirements[k]) {
          found = found || held[turn];
        }
        if (found &&
          (held[k] || registers.filter((r) => r.name === k).length)) {
          valid[k] = true;
        }
      }
      if (Object.keys(valid).length) {
        setActive(option);
        setRegister(undefined);
        setValid(valid);
      }
    },

    set_register: (i) => {
      var mv = registers[i].program[0];
      setRegister(i);
      setValid(VALID[mv.name]);
    },

    clear: (r) => {
      registers[r].program = [];
      const reg = registers.map((r) => r.program);
      program.update_used(registers);
      ws.send({ cmd: 'program', registers: reg });
    },

    ready: () => {
      ws.send({ cmd: 'ready' });
    },

    recompile: () => {
      ws.send({ cmd: 'recompile' });
      setConfirmRecompile(false);
    },

    cancel_recompile: () => {
      setConfirmRecompile(false);
    }
  };

  useMessages({
    programming: (msg) => {
      console.log('programming');
      var heldCards = [];
      if (msg.cards) {
        heldCards = msg.cards.sort((a, b) => b.priority - a.priority);
      }
      context.private.cards = heldCards;
      context.state = { recompiled: msg.recompiled };
      setUsed({});
      setCards(heldCards);
      setRegisters(msg.registers);
    },

    program: (msg) => {
      console.log('program');
      context.private.registers = msg.registers;
      program.update_used(msg.registers);
      setRegisters(msg.registers.clone());
    },

    error: (msg) => {
      program.update_used(context.private.registers);
      setRegisters(context.private.registers.clone());
    },
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

  let recompile = confirmRecompile ? (
    <Modal title="Confirm Recompile" closeText="Cancel" close={program.cancel_recompile}>
      <div style={imgStyle}>
        <img src="images/recompile.svg" style={{ width: '100%' }} alt="Recompile" />
      </div>
      <span style={{ color: 'black' }}>
        Are you sure?<br />
        You will take 1 damage and get new cards.
        </span>
      <Button onClick={program.recompile.bind(this)} bg="green">
        Yes
        </Button>
    </Modal>)
    : null;

  var registerObjs = registers.map(function (r, i) {
    if (valid[r.name]) {
      let f = active ? program.set_register : program.clear;
      return <Register register={r} key={"register" + i} onClick={f.bind(false, i)} />;
    }
    else {
      return <Register register={r} key={"register" + i} inactive={true} />;
    }
  });

  if (context.me.shutdown) {
    return <Shutdown />;
  }

  const movementCards = cards.map(function (c) {
    if (used[c.priority] || !valid[c.name]) {
      return <Icon card={c} key={c.priority} className="inactive" />;
    }
    else {
      let click = program.choose.bind(false, c);
      return <Icon card={c} key={c.priority} onClick={click} />;
    }
  });

  return (
    <Content>
      <OptionPanel active={active} setActive={setActive}>
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
      <Button bg={context.me.ready ? 'red' : 'green'} onClick={program.ready}>
        {context.me.ready ? 'Not Ready' : 'Ready'}
      </Button>
      {recompile}
    </Content >
  );
});
