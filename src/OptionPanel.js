import { GameContext, LASER_OPTION } from './Util';
import React, { useContext, useState } from 'react';
import OptionCards from './OptionCards';
import OptionModal from './OptionModal';
import { Panel } from './UI';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
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

  let held = [];
  let children = props.children;
  if (!Array.isArray(children)) {
    children = [children];
  }
  for (var o of children) {
    let element = OptionCards[o.props.name].render(props, showHelp, openHelp, context);
    if (element !== null) {
      held.push(element);
    }
  }

  if (held.length < (props.min || 1)) {
    return null;
  }

  let card = show === 'laser'
    ? LASER_OPTION
    : context.me.options[show];

  return (
    <Panel background="neutral-3" title="Option Cards" onHelp={toggleHelp} direction="row">
      {held}
      <OptionModal card={card} done={closeHelp} />
    </Panel>
  );
});
