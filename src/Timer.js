import { GameContext, useMessages } from './Util';
import React, { useContext, useEffect, useState } from 'react';
import { Meter } from './UI';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
    let context = useContext(GameContext)
    let [color, setColor] = useState('white');
    let [timer, setTimer] = useState(undefined);
    let [percent, setPercent] = useState(0);

    function start() {
        if (timer === undefined && context.public.timer) {
            update();
            setTimer(setInterval(update, 100));
        }
    }

    function stop() {
        if (timer) {
            clearInterval(timer);
        }
        setTimer(undefined);
        setPercent(0);
        delete context.public.timer;
    }

    useEffect(() => {
        start();
        return () => {
            if (timer) clearInterval(timer);
        }
    }, []);

    useMessages({
        state: stop,
        timer: (msg) => {
            context.public.timer = msg;
            start();
        }
    });

    function update() {
        let now = new Date().getTime();
        let t = context.public.timer;
        if (!t) {
            return;
        }
        let target = t.start + t.duration - context.timediff;
        let remaining = target - now;
        if (remaining > 0) {
            let per = (t.duration - remaining) / t.duration * 100;
            setPercent(per);
            setColor(per > 75 ? "red"
                : per > 60 ? "orange"
                    : "white");
        } else {
            stop();
        }
    }

    if (percent === 0) {
        return <div />
    }

    return (
        <Meter type="circle" thickness="large"
            style={{ width: '2.5em', height: '2.5em' }}
            margin={{ vertical: '.5em' }}
            values={[{
                value: percent,
                color: color,
            }]} />
    );
});
