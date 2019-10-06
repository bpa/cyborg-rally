import { ws, GameContext, useMessages } from './Util';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Box, Dead, Frame, Registers } from "./UI";
import Announcing from "./Announcing";
import ConditionalProgramming from './ConditionalProgramming';
import Configuring from "./Configuring";
import Firing from "./Firing"
import Lasers from "./Lasers";
import Movement from "./Movement";
import PendingDamage from "./PendingDamage";
import Programming from "./Programming";
import Setup from './Setup';
import Timer from "./Timer";
import Touching from "./Touching";
import Vitality from "./Vitality";
import Waiting from "./Waiting";

var STATE = {
    Announcing: Announcing,
    ConditionalProgramming: ConditionalProgramming,
    Configuring: Configuring,
    Firing: Firing,
    Lasers: Lasers,
    Movement: Movement,
    PowerDown: Announcing,
    Programming: Programming,
    Setup: Setup,
    Touching: Touching,
};

export default observer(() => {
    let context = useContext(GameContext);
    let player = (msg) => context.public.player[msg.player];
    useMessages({
        ready: (msg) => player(msg).ready = true,
        not_ready: (msg) => player(msg).ready = false,
        announce: (msg) => player(msg).will_shutdown = msg.shutdown,
        shutdown: (msg) => player(msg).shutdown = msg.activate,
        death: (msg) => {
            let p = player(msg);
            p.dead = true;
            p.lives = msg.lives;
        },
        option: (msg) => player(msg).options[msg.option.name] = msg.option,
        options: (msg) => player(msg).options = msg.options,
        revive: (msg) => {
            let p = player(msg);
            p.dead = false;
            p.damage = msg.damage;
        },
        join: (msg) => {
            console.log(context);
            context.public.player[msg.id] = msg.player;
        },
        quit: (msg) => delete context.public.player[msg.id],
        setup: (msg) => context.public = msg.public,
        state: (msg) => {
            context.state = {};
            context.public.state = msg.state;
            var players = context.public.player;
            Object.keys(players).map((p) => players[p].ready = 0);

            if (msg.state === 'PowerDown') {
                Object.keys(players).forEach((p) => {
                    delete players[p].shutdown;
                    delete players[p].will_shutdown;
                });
            }
            if (msg.state === 'Programming') {
                context.public.register = undefined;
            }
            else if (msg.state === 'Movement') {
                if (context.public.register === undefined)
                    context.public.register = 0;
                else
                    context.public.register++;
            }
        },
        damage: msg => player(msg).damage = msg.damage,
    });

    let quit = () => ws.send({ cmd: 'quit' });

    const State = context.me.dead ? Dead : STATE[context.public.state] || Waiting;
    var progress
        = context.public.register !== undefined
            ? <Registers active={context.public.register} />
            : <span>&nbsp;</span>;

    return (
        <div>
            <Frame background="brand">
                <Box pad="medium" justify="between" align="start" direction="row">
                    <div>
                        <div>{context.public.state.replace('_', ' ')}</div>
                        {progress}
                    </div>
                    <Timer />
                    <Vitality player={context.me} />
                </Box>
                <State />
            </Frame>
            <hr />
            <div style={{ display: 'flex' }}>
                <Button quit onClick={quit} style={{ width: '100%' }}>
                    Quit
                </Button>
            </div>
            <PendingDamage />
        </div>
    );
});
