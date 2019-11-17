import { ws, GameContext, useMessages } from './Util';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Dead, Frame, Registers } from "./UI";
import Announcing from "./Announcing";
import ConditionalProgramming from './ConditionalProgramming';
import Configuring from "./Configuring";
import Firing from "./Firing"
import Lasers from "./Lasers";
import Movement from "./Movement";
import NewCard from './NewCard';
import PendingDamage from "./PendingDamage";
import Programming from "./Programming";
import Setup from './Setup';
import Timer from "./Timer";
import Touching from "./Touching";
import Vitality from "./Vitality";
import Waiting from "./Waiting";
import { Menu } from 'grommet';

var STATE = {
    Announcing: Announcing,
    ConditionalProgramming: ConditionalProgramming,
    Configuring: Configuring,
    Firing: Firing,
    Lasers: Lasers,
    Movement: Movement,
    NewCard: NewCard,
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
        join: (msg) => context.public.player[msg.id] = msg.player,
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
        damage: msg => {
            let p = player(msg);
            p.damage = msg.damage;
            p.registers = msg.registers;
        },
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
                <Box pad="medium" align="start" direction="row">
                    <Menu style={{ flex: "2 1 0" }} icon="☰" items={[{ label: 'Quit', onClick: quit }]}></Menu>
                    <div style={{ flex: "7 1 0" }}>
                        <div>{context.public.state.replace('_', ' ')}</div>
                        {progress}
                    </div>
                    <div style={{ flex: "3 1 0" }}><Timer /></div>
                    <Vitality style={{ flex: "4 1 0" }} player={context.me} />
                </Box>
                <State />
            </Frame>
            <PendingDamage />
        </div>
    );
});
