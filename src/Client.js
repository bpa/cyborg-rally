import { extendObservable } from 'mobx';
import { ws, GameContext } from './Util';
import React from 'react';
import Lobby from "./Lobby";
import Playing from "./Playing";
import RegisteredComponent from './RegisteredComponent';
import theme from "./theme";
import { Grommet } from 'grommet';

/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

if (!Array.prototype.clone) {
    Array.prototype.clone = function () {
        return JSON.parse(JSON.stringify(this));
    };
};

if (!Array.prototype.remove) {
    Array.prototype.remove = function (cb) {
        var i = this.findIndex(cb);
        if (i > -1) {
            this.splice(i, 1);
        }
    };
};

export default class Client extends RegisteredComponent {
    constructor() {
        super();
        ws.init();
        this.state = {
            view: () => <div>Initializing...</div>,
            context: {},
        };
        this.setView = this.setView.bind(this);
        this.back = this.back.bind(this);
        this.stack = [Lobby];
    }

    componentDidCatch(error) {
        ws.send({
            cmd: 'error',
            message: error.message,
            stack: error.stack
        });
    }

    setView(view) {
        this.stack.push(view);
        this.setState({ view: view });
    }

    back() {
        this.stack.pop();
        this.setState({ view: this.stack[this.stack.length - 1] });
    }

    render() {
        const View = this.state.view;
        return (
            <Grommet theme={theme}>
                <GameContext.Provider value={this.state.context}>
                    <View setView={this.setView} back={this.back} />
                </GameContext.Provider>
            </Grommet>);
    }

    on_welcome(msg) {
        if (window.localStorage.token !== undefined) {
            ws.send({
                cmd: 'login',
                name: window.localStorage.name,
                token: window.localStorage.token,
            });
        }
        else {
            ws.send({ cmd: 'login', name: window.localStorage.name });
        }
    }

    on_login(msg) {
        window.localStorage.token = msg.token;
    }

    on_joined(msg) {
        delete msg.cmd;
        msg.timediff = new Date().getTime() - msg.now;
        this.setState({
            view: msg.game === 'Rally' ? Playing : Lobby,
            context: extendObservable({
                get me() {
                    return this.public.player[this.id];
                }
            }, msg),
        });
    }
}
