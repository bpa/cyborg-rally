import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import ConfirmOption from './ConfirmOption';
import OptionPanel from './OptionPanel';
import Ready from './Ready';
import Player from './Player';
import Damage, { Targets } from './Damage';
import { Shutdown, Content } from './UI';

export default function Movement(props) {
  let context = useContext(GameContext);
  let [active, setActive] = useState(false);
  let [confirm, setConfirm] = useState(null);
  let [order, setOrder] = useState(context.state.order || []);

  useMessages({
    move: msg => setOrder(msg.order),
  });

  if (context.me.shutdown) {
    return <Shutdown />
  }

  function activate(option) {
    if (option === 'Abort Switch') {
      setConfirm({
        name: option,
        message: <span>This register and all remaining registers will be replaced.</span>,
        action: () => ws.send({ cmd: 'abort' }),
      });
    }
    if (option === 'Ramming Gear') {
      setActive(option);
    }
  }

  function confirm_ram() {
    confirm.action();
    setConfirm(undefined);
  }

  let cancel = () => setConfirm(undefined);

  let ram = (player) => ws.send({ cmd: 'ram', target: player });

  const players = context.public.player;

  return (
    <Content>
      <OptionPanel active={active} setActive={setActive}>
        <o name='Abort Switch' />
        <o name='Ramming Gear' />
      </OptionPanel>
      <Ready />
      <hr />
      {active === 'Ramming Gear'
        ? < Targets active={active} onClick={ram.bind(null, active)} />
        : order.map((o) =>
          <Player player={players[o.player]} key={o.player} register={o} />)
      }

      <ConfirmOption option={confirm} onConfirm={confirm_ram} onCancel={cancel} />
      <Damage />
    </Content>
  )
}
