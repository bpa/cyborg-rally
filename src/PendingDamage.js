import { ws, GameContext, getFile, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import { Button, Panel } from './UI';
import Modal from './Modal';
import OptionModal from './OptionModal';
import Icon from './Icon';

export default function PendingDamage() {
  let context = useContext(GameContext);

  let [show, setShow] = useState(undefined);
  let [showHelp, setShowHelp] = useState(false);

  function openHelp(option) {
    setShow(option);
    setShowHelp(false);
  }

  function closeHelp() {
    setShow(undefined);
    setShowHelp(false);
  }

  function toggleHelp() {
    setShowHelp(help => !help);
  }

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

  function choice(option) {
    var className = showHelp ? "help" : "add-on";
    var onClick = showHelp ? () => setShow(context.me.options[option]) : () => setSelected(option);
    return <Icon key={option} name={option} onClick={onClick} className={className} />;
  }

  function render_discard() {
    let options = context.me.options;
    let keys = Object.keys(options || {});
    let available = keys.map(choice);
    return (
      <Modal title="Damage Pending" onHelp={toggleHelp}
        closeText="Have Robot Take Damage" close={() => setSelected('robot')}>
        <Panel background="accent-2" title="Discard Option" direction="row">
          {available}
        </Panel>
        <OptionModal card={show} done={closeHelp} />
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
