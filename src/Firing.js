import { GameContext, useMessages, ws } from './Util';
import React, { useContext, useState } from 'react';
import Ready from './Ready';
import OptionPanel from './OptionPanel';
import FireControl from './FireControl';
import { Content, Shutdown } from './UI';
import Damage, { Targets } from './Damage';

function fire(type, p) {
    ws.send({ cmd: 'fire', type: type, target: p });
}

//This isn't observable because there is no way for shutdown status to change during this phase
export default function Firing() {
    let context = useContext(GameContext);
    let [active, setActive] = useState('laser');

    if (context.me.shutdown) {
        return <Shutdown><Damage /></Shutdown>;
    }

    return (
        <Content>
            <OptionPanel active={active} setActive={setActive} min={2}>
                <o name='laser' />
                <o name='Rear-Firing Laser' />
                <o name='High-Power Laser' />
                <o name='Fire Control' />
                <o name='Mini Howitzer' />
                <o name='Pressor Beam' />
                <o name='Radio Control' />
                <o name='Scrambler' />
                <o name='Tractor Beam' />
            </OptionPanel>
            <Ready readyText="No one in line of sight" />
            <hr />
            <Targets active={active} onClick={(p) => fire(active, p)} />
            <Damage />
            <FireControl />
        </Content>
    );
}
