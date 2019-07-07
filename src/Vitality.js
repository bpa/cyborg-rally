import { GameContext } from './Util';
import React, { useContext } from 'react';
import { Badge } from './UI';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
  let context = useContext(GameContext);

  const p = props.player;
  var life = context.opts.lives === 'Inf' ? null : (
    <div>
      <span>Life:</span>
      <Badge bg="green">{p.lives}/{context.opts.lives}</Badge>
    </div>
  );

  if (!p.memory) {
    return <div width="16px" />;
  }
  //const dmg = ''.padEnd(p.damage, '♡').padStart(p.memory, '♥');
  //const lives = ''.padEnd(p.lives, '●').padEnd(3, '○');
  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <span style={{ fontWeight: 'bold' }}>Health:</span>
        <Badge mr={0} bg="yellow" color="black">
          {p.memory - p.damage}/{p.memory}
        </Badge>
      </div>
      {life}
    </div>
  )
});
