import { GameContext, useMessages, getFile } from './Util';
import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Ready from './Ready';
import { Content } from './UI';
import { Box } from 'grommet';
import OptionModal from './OptionModal';

function toMap(arr) {
  var map = {};
  arr.forEach(o => map[o] = 1);
  return map;
}

const small = { margin: "auto", display: "block", height: "20px", float: "left" };
const large = { margin: "auto", display: "block", height: "40px" };

export default observer(() => {
  let context = useContext(GameContext);
  let [option, setOption] = useState(undefined);

  useMessages({
    new_options: (msg) => context.state = toMap(msg.options)
  });

  const players = context.public.player;
  const alive = Object.values(players).filter(p => !p.dead).sort((a, b) => a.name.localeCompare(b.name));

  function player(p, id) {
    var newOption;
    let existing = [];
    let options = p.options;
    for (var o in options) {
      if (context.state[o]) {
        newOption = o;
      } else {
        existing.push(o);
      }
    }
    existing = Object.values(existing).sort((a, b) => a.name < b.name);
    return (
      <Box round="small" background={p.ready ? 'green' : 'red'} direction="row" key={'p' + id}>
        <div style={{ flex: "1 1 0", textAlign: "center", lineHeight: "40px" }}>{newOption ? "New:" : null}</div>
        <div style={{ flex: "1 1 0" }}>{newOption ? optionCard(context.public.option[newOption], large) : null}</div>
        <div style={{ flex: "3 1 0", textAlign: "center", lineHeight: '40px' }}>{p.name}{p.shutdown ? '.zZ' : ''}</div>
        <div style={{ flex: "2 1 0", margin: "auto" }}>
          {existing.map((o) => optionCard(context.public.option[o], small))}
        </div>
      </Box >);
  }

  function optionCard(o, style) {
    return (<img src={getFile(o)}
      key={o.name}
      style={style}
      onClick={() => setOption(o)}
      alt={o.name}
    />);
  }

  return (
    <Content>
      <Ready />
      <hr />
      <Box gap="small">
        {alive.map(player)}
      </Box>
      <OptionModal card={option} done={() => setOption(undefined)} />
    </Content>
  );
});
