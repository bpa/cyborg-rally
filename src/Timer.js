import { GameContext } from './Util';
import React, { Component } from 'react';
import { Meter } from './UI';

export default class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        var timer = this.props.timer;
        if (timer) {
            this.timediff = this.props.timediff;
            this.duration = timer.duration;
            this.expires = timer.start + timer.duration - GameContext.timediff;
            if (this.expires > new Date().getTime()) {
                this.start();
            }
        }
    }

    stop_timer() {
        if (this.interval) {
            clearInterval(this.interval);
            delete this.interval;
            this.setState({ value: 0 });
        }
    }

    componentWillUnmount() {
        this.stop_timer();
    }

    on_state(msg) {
        this.stop_timer();
    }

    start() {
        this.update();
        if (!this.interval) {
            this.interval = setInterval(this.update.bind(this), 100);
        }
    }

    update() {
        var now = new Date().getTime();
        var remaining = this.expires - now;
        var color
            = remaining < 5000 ? "red"
                : remaining < 10000 ? "orange"
                    : "white";
        if (remaining > 0) {
            this.setState({
                value: 1 - remaining / this.duration,
                secondsRemaining: Math.ceil(remaining / 1000),
                color: color
            });
        }
        else {
            clearInterval(this.interval);
            delete this.interval;
            this.setState({ value: 0, secondsRemaining: 0 });
        }
    }

    on_timer(msg) {
        var now = new Date().getTime();
        var timediff = now - msg.start;
        this.duration = msg.duration;
        this.expires = msg.start + msg.duration - timediff;
        this.start();
    }

    render() {
        return this.interval
            ? (<Meter type="circle" values={[this.state]}>
                {this.state.secondsRemaining}
            </Meter>)
            : <div style={{ width: 32, marginLeft: 16 }} />;
    }
}
