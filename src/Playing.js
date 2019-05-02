import { ws, GameContext } from './Util';
import React from 'react';
import { Button, Box, Frame, Registers } from "./UI";
import Announcing from "./Announcing";
import Configuring from "./Configuring";
import ConditionalProgramming from './ConditionalProgramming';
import Firing from "./Firing"
import Lasers from "./Lasers";
import Movement from "./Movement";
import PendingDamage from "./PendingDamage";
import Programming from "./Programming";
import Timer from "./Timer";
import Touching from "./Touching";
import Vitality from "./Vitality";
import Waiting from "./Waiting";
import RegisteredComponent from './RegisteredComponent';

var STATE = {
    Announcing: Announcing,
    Configuring: Configuring,
    Firing: Firing,
    Lasers: Lasers,
    ConditionalProgramming: ConditionalProgramming,
    Movement: Movement,
    PowerDown: Announcing,
    Programming: Programming,
    Touching: Touching,
};

export default class Playing extends RegisteredComponent {
    static contextType = GameContext;

    constructor(props) {
        super(props);
        this.quit = this.quit.bind(this);
        this.view = [];
        this.state = {
            pending_damage: {},
        };
        this.on_ready = this.on((msg, p) => p.ready = true);
        this.on_not_ready = this.on((msg, p) => p.ready = false);
        this.on_announce = this.on((msg, p) => p.will_shutdown = msg.shutdown);
        this.on_shutdown = this.on((msg, p) => p.shutdown = msg.activate);
        this.on_death = this.on((msg, p) => {
            p.dead = true;
            p.lives = msg.lives;
        });
        this.on_option = this.on((msg, p) => p.options[msg.option.name] = msg.option);
        this.on_options = this.on((msg, p) => p.options = msg.options);
        this.on_revive = this.on((msg, p) => {
            p.dead = false;
            p.damage = msg.damage;
        });
    }

    on(f) {
        let self = this;
        return function (msg) {
            let pub = self.context.public;
            let player = pub.player[msg.player];
            f(msg, player);
            self.context.set({ public: pub });
        }
    }

    on_join(msg) {
        this.context.public.player[msg.id] = msg.player;
        this.context.set({});
    }

    on_quit(msg) {
        delete this.context.public.player[msg.id];
        this.context.set({});
    }

    on_setup(msg) { this.context.set({ public: msg.public }); }

    on_state(msg) {
        let data = this.context;
        data.state = null;
        data.public.state = msg.state;
        var players = data.public.player;
        Object.keys(players).map((p) => players[p].ready = 0);
        var view = STATE[msg.state];
        if (!view) {
            view = Waiting;
        }
        if (msg.state === 'PowerDown') {
            Object.keys(players).forEach((p) => {
                delete players[p].shutdown;
                delete players[p].will_shutdown;
            });
        }
        if (msg.state === 'Programming') {
            data.public.register = undefined;
        }
        else if (msg.state === 'Movement') {
            if (data.public.register === undefined)
                data.public.register = 0;
            else
                data.public.register++;
        }
        this.setState({
            context: data,
            view: view,
        });
    }

    on_pending_damage(msg) {
        this.context.set({ pending_damage: msg.damage });
    }

    quit() {
        ws.send({ cmd: 'quit' });
    }

    render() {
        console.log(this.context.me);
        const State = this.context.me.dead ? Dead : STATE[this.context.public.state] || Waiting;
        var progress
            = this.context.public.register !== undefined
                ? <Registers active={this.context.public.register} />
                : <span>&nbsp;</span>;

        return (
            <div>
                <Frame background="brand">
                    <Box pad="medium" align="center" direction="row">
                        <div>
                            <div>{this.context.public.state.replace('_', ' ')}</div>
                            {progress}
                        </div>
                        <Timer ref={(e) => this.view[0] = e} />
                        <Vitality player={this.context.me} />
                    </Box>
                    <State />
                </Frame>
                <hr />
                <Button background="red" onClick={this.quit}>
                    Quit
                </Button>
                <PendingDamage />
            </div>
        );
    }
}

function Dead() {
    return <div style={{ fontSize: 120, textAlign: 'center' }}>(x_x)</div>
}
