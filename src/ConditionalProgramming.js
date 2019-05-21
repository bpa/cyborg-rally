import { ws, GameContext } from './Util';
import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import OptionModal from './OptionModal';
import { Badge, Panel } from './UI';
import { Tile, TileSet } from './TileSet';
import Player from './Player';

const cond_str = 'Conditional Program';

export default observer(props => {
    let context = useContext(GameContext);
    let [help, setHelp] = useState(null);

    if (!context.me.options[cond_str]) {
        return <Player player={context.public.player.slice().find(p => p.options[cond_str])} />
    }

    let reprogram = (replace) => {
        ws.send({ cmd: 'conditional_program', replace: replace });
    }

    return (
        <Panel color="accent-1" header={
            <div>
                Conditional Program
                    <span style={{ position: 'absolute', right: '' }}>
                    <Badge onClick={() => setHelp(context.me.options[cond_str])}>?</Badge>
                </span>
            </div>
        }>
            <TileSet onClick={reprogram}>
                <Tile id={true} bg="green">Replace movevent card</Tile>
                <Tile id={false} bg="red">Leave it alone</Tile>
            </TileSet>
            <OptionModal card={help} done={() => setHelp(null)} />
        </Panel>
    );
});
