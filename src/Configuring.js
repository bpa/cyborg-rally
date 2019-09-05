import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from './Icon';
import { Content, Panel, Shutdown } from './UI';
import { Tile, TileSet } from './TileSet';
import OptionModal from './OptionModal';
import Waiting from './Waiting';

var stabilizer = 'Gyroscopic Stabilizer';

export default observer(props => {
  let context = useContext(GameContext);
  if (!context.state) {
    context.state = {};
  }

  context.state[context.id] = (context.me.options[stabilizer] && context.me.options[stabilizer].tapped) ? 1 : 0;
  let [help, setHelp] = useState(undefined);

  useMessages({
    remaining: (msg) => {
      if (msg.cards) {
        let cards = msg.cards.sort((a, b) => b.priority - a.priority);
        context.private.cards = cards;
      }
    },

    options: (msg) => {
      context.state[context.id] = (context.me.options[stabilizer] && context.me.options[stabilizer].tapped) ? 1 : 0;
    }
  });

  function openHelp(option) {
    setHelp(context.public.option[option]);
  }

  function closeHelp() {
    setHelp(undefined);
  }

  function stabilize(activate) {
    ws.send({ cmd: 'configure', option: 'Gyroscopic Stabilizer', activate: activate });
  }

  function configure(option, card) {
    ws.send({ cmd: 'configure', option: option, card: card });
  }

  if (context.me.shutdown) {
    return <Shutdown />
  }

  let controls = [];

  if (context.me.options['Gyroscopic Stabilizer']) {
    controls.push(
      <Panel background="accent-1" title="Gyroscopic Stabilizer" key="stabilizer"
        onHelp={() => openHelp('Gyroscopic Stabilizer')}>
        <TileSet onClick={stabilize} key="stabilizer">
          <Tile id={1} bg="green">Activate</Tile>
          <Tile id={0} bg="red">Allow board to rotate me</Tile>
        </TileSet>
      </Panel>
    );
  }

  ['Flywheel', 'Conditional Program'].forEach(card => {
    let opt = context.me.options[card];
    if (opt) {
      const cards = context.private.cards.map((c) => {
        let className = opt.card && opt.card.priority == c.priority ? 'selected' : '';
        return <Icon card={c} key={c.priority} className={className}
          onClick={() => configure(card, c)} />;
      }
      );

      controls.push(
        <Panel background="accent-2" key={card} title={card} onHelp={() => openHelp(card)}>
          <Content direction="row" wrap={true}>{cards}</Content>
        </Panel>
      );
    }
  });

  if (controls.length === 0) {
    return <Waiting {...props} />;
  }

  return (
    <Content>
      {controls}
      <OptionModal card={help} done={closeHelp} />
    </Content>
  );
})
