import { ws, GameContext } from './Util';
import React, { Component } from 'react';
import { Button } from './UI';

export default class Ready extends Component {
    static contextType = GameContext;

    render() {
        if (!this.context.me.ready) {
            return (
                <Button onClick={() => ws.send({ cmd: 'ready' })}
                    background="radial-gradient(circle, orange 40%, red)">
                    {this.props.readyText || 'Ready'}
                </Button>
            );
        }

        if (this.context.public.state === 'Waiting') {
            return <Button bg="red" onClick={() => ws.send({ cmd: 'not_ready' })}>Not Ready</Button>;
        }

        return <Button bg="green">Waiting...</Button>;
    }
}
