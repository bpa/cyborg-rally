import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useReducer, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from './Icon';
import { Button, Content, Panel, Shutdown } from './UI';
import { Tile, TileSet } from './TileSet';
import OptionModal from './OptionModal';
import Waiting from './Waiting';

var stabilizer = 'Gyroscopic Stabilizer';

function select(state, action) {
  for (var k in state) {
    if (state[k] && state[k].priority === action.value.priority) {
      delete state[k];
    }
  }
  state[action.key] = action.value;
  return { ...state };
}

export default observer(props => {
  let context = useContext(GameContext);
  if (!context.state || context.state[context.id] === undefined) {
    context.state = {
      [context.id]: (context.me.options[stabilizer] && context.me.options[stabilizer].tapped) ? 1 : 0
    };
  }

  let [help, setHelp] = useState(undefined);
  let [choices, choose] = useReducer(select, {});

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

  function configure() {
    if (context.me.options[stabilizer]) {
      ws.send({ cmd: 'configure', option: 'Gyroscopic Stabilizer', activate: !!choices.stabilizer });
    }
    ['Flywheel', 'Conditional Program'].forEach(opt => {
      if (context.me.options[opt]) {
        ws.send({ cmd: 'configure', option: opt, card: choices[opt] });
      }
    });
  }

  if (context.me.shutdown) {
    return <Shutdown />
  }

  let controls = [];

  if (context.me.options['Gyroscopic Stabilizer']) {
    controls.push(
      <Panel background="accent-1" title="Gyroscopic Stabilizer" key="stabilizer"
        onHelp={() => openHelp('Gyroscopic Stabilizer')}>
        <TileSet onClick={(v) => context.state[context.id] = v} key="stabilizer">
          <Tile id={1}>Activate</Tile>
          <Tile id={0}>Allow board to rotate me</Tile>
        </TileSet>
      </Panel>
    );
  }

  ['Flywheel', 'Conditional Program'].forEach(card => {
    let opt = context.me.options[card];
    if (opt) {
      let cards = context.private.cards.map((c) => {
        let className = (choices[card] && choices[card].priority === c.priority) ? 'selected' : '';
        return <Icon card={c} key={c.priority} className={className}
          onClick={() => choose({ key: card, value: c })} />;
      });

      let className = choices[card] ? '' : 'selected';
      cards.push(<Icon key={0} card={{ name: 'null' }} className={className}
        onClick={() => choose({ key: card })} />)

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
      <Button ready onClick={configure}>
        Ready
      </Button>
      <OptionModal card={help} done={closeHelp} />
    </Content>
  );
})
