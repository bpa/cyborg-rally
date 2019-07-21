import { ws, GameContext, getFile, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import { Button, Panel } from './UI';
import Modal from './Modal';

export default function PendingDamage() {
  let context = useContext(GameContext);

  let [selected, setSelected] = useState(undefined);
  let [pending, setPending] = useState(() => {
    return (context.state
      && context.state.pending_damage
      && context.state.pending_damage[context.id])
      || 0;
  });

  useMessages({
    pending_damage: (msg) => setPending(msg.damage)
  });

  function discard() {
    ws.send({ cmd: 'damage', target: selected });
    setSelected(undefined);
  }

  function choice(options, option) {
    let src = getFile(options[option]);
    return (
      <Button key={option} onClick={() => setSelected(option)}
        style={{
          height: '48px', width: '48px',
          padding: '8px', margin: '8px 4px 0px 4px',
          border: '2px solid green', borderRadius: '8px',
        }}>
        <img src={src} style={{ height: '100%' }} alt={option} />
      </Button>
    );
  }

  function render_discard() {
    let options = context.me.options;
    let keys = Object.keys(options || {});
    let available = keys.map(choice.bind(null, options));
    return (
      <Modal title="Damage Pending" closeText="Have Robot Take Damage" close={() => setSelected('robot')}>
        <Panel color="accent-2" title="Discard Option">
          {available}
        </Panel>
      </Modal>);
  }

  function render_robot() {
    return (
      <Modal title="Damage Pending" close={() => setSelected(undefined)} closeText="Nevermind">
        Are you sure you want to damage your robot?
        <Button onClick={discard}>Yes, damage my robot</Button>
      </Modal>);
  }

  function render_confirm() {
    return (
      <Modal title="Damage Pending" close={() => setSelected(undefined)} closeText="Nevermind">
        Are you sure you want to discard {selected}?
        <Button onClick={discard}>Yes, discard option</Button>
      </Modal>);
  }

  if (!pending) {
    return null;
  }
  if (selected === undefined) {
    return render_discard();
  }
  if (selected === 'robot') {
    return render_robot();
  }
  return render_confirm();
}
