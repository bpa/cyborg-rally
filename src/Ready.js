import { ws, GameContext } from './Util';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from './UI';

export default observer(props => {
    let context = useContext(GameContext);
    if (!context.me.ready) {
        return (
            <Button ready onClick={() => ws.send({ cmd: 'ready' })}>
                {props.readyText || 'Ready'}
            </Button>
        );
    }

    if (context.public.state === 'Waiting') {
        return <Button target onClick={() => ws.send({ cmd: 'not_ready' })}>Not Ready</Button>;
    }

    return <Button>Waiting...</Button>;
});
