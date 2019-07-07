import { GameContext, useMessages } from './Util';
import React, { useContext, useEffect, useState } from 'react';
import { Meter } from './UI';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
    let context = useContext(GameContext);

    let [remaining, setRemaining] = useState(() => {
        let t = context.public.timer;
        if (t) {
            t.target = t.start + t.duration - context.timediff;
            let now = new Date().getTime();
            return t.target - now;
        }
        return 0;
    });

    function updateRemaining() {
        let now = new Date().getTime();
        let target = context.public.timer.target;
        setRemaining(target < now ? 0 : target - now);
    }

    let [timer, setTimer] = useState(() => context.public.timer ? setInterval(updateRemaining, 100) : undefined);

    useEffect(() => {
        return () => clearInterval(timer);
    }, [timer]);

    useMessages({
        state: () => {
            delete context.public.timer;
            setTimer(undefined);
            setRemaining(0);
        },
        timer: msg => {
            context.public.timer = {
                start: msg.start,
                duration: msg.duration,
                target: msg.start + msg.duration - context.timediff
            };
            let now = new Date().getTime();
            setRemaining(context.public.timer.target - now);
            setTimer(setInterval(updateRemaining, 100));
        },
    });

    let t = context.public.timer;
    if (t && !remaining) {
        setTimer(undefined);
        delete context.public.timer;
    }

    if (!t) {
        return <div />
    }

    let percent = (t.duration - remaining) / t.duration * 100;
    let color = percent > 75 ? "red"
        : percent > 60 ? "orange"
            : "white";

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
