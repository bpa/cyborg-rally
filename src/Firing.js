import { GameContext, useMessages, ws } from './Util';
import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Ready from './Ready';
import OptionPanel from './OptionPanel';
import FireControl from './FireControl';
import { Content, Shutdown } from './UI';
import Damage, { Targets } from './Damage';

function fire(type, p) {
    ws.send({ cmd: 'fire', type: type, target: p });
}

export default observer(props => {
    let context = useContext(GameContext);
    let [active, setActive] = useState('laser');
    let [fireControl, setFireControl] = useState(null);

    if (context.state && context.me.options['Fire Control']) {
        setFireControl(context.state['Fire Control']);
    }

    useMessages({
        fire_control: (msg) => {
            console.log(msg);
            setFireControl(msg.target);
        }
    });

    if (context.me.shutdown) {
        return <Shutdown><Damage/></Shutdown>;
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
            <Targets active={active} onClick={fire.bind(null, active)} />
            <Damage />
            <FireControl target={fireControl} />
        </Content>
    );
});
