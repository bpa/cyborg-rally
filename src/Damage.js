import { ws, GameContext, remove, useMessages } from './Util';
import React from 'react';
import { useContext, useState } from 'react';
import ConfirmShot from './ConfirmShot';
import Deny from './Deny';
import Dispute from './Dispute';
import Player from './Player';
import { Button } from './UI';

function Sight() {
    return (
        <span>
            <svg viewBox="0 0 100 100" style={{ width: "0.75em" }}>
                <g fill="currentColor" stroke="currentColor">
                    <use href="#sight" />
                </g>
            </svg>
        </span>
    );
}

export function Targets(props) {
    console.log(props);
    let context = useContext(GameContext);
    var player = context.public.player;
    const keys = Object.keys(player)
        .sort()
        .filter(p => p !== context.id && !player[p].dead)
        .map(id => {
            const p = player[id];
            if (context.me.ready) {
                return <Player player={p} key={id} />
            } else {
                return (
                    <Button key={id} bg='black' color="red" onClick={() => { console.log("pew, pew"); props.onClick(p) }}>
                        <div><Sight /> {p.name} <Sight></Sight></div>
                    </Button>)
            }
        });
    return <>{keys}</>;
}
// dmg.activate = o => setActive(o);
// dmg.deactivate = () => setActive('laser');

// var pending = dmg.pendingShots.map((s) => (
//     <ConfirmShot player={context.me} shot={s} key={s.player}
//         confirm={dmg.confirm.bind(null, s)}
//         deny={dmg.deny.bind(null, s)} />
// ));

// var disputes = dmg.disputed.map((d) => (
//     <Dispute shot={d} key={d.player} vote={dmg.vote.bind(null, d)} />
// ));

export default function Damage() {
    var context = useContext(GameContext);
    var [pendingShots, setPendingShots] = useState([]);
    var [denied, setDenied] = useState([]);
    var [disputed, setDisputed] = useState([]);

    useMessages({
        fire: (msg) => setPendingShots(p => p.push(msg)),
        confirm: (msg) => setPendingShots(pend => remove(pend, p => p.player === msg.player)),
        deny: (msg) => {
            if (Object.keys(context.public.player).length > 2) {
                setDenied(d => d.push({ player: msg.player, type: msg.type }));
            }
        },
        dispute: (msg) => setDisputed(disputed => disputed.push(msg)),
        resolution: (msg) => setDisputed(disputed => remove(disputed, s => s.target === msg.target && s.player === msg.player)),
        ram: msg => dmg.setPendingShots(pending => pending.push({ player: msg.player, type: 'Ramming Gear' })),
    });

    if (context.state) {
        for (var shot of context.state.shots) {
            if (shot.dispute) {
                if (shot.voted[context.id] === undefined) {
                    disputed.push(shot);
                }
            }
            else if (shot.target === context.id) {
                /*eslint no-loop-func: "off"*/
                setPendingShots(p => p.push({ player: shot.player, type: shot.type }));
            }
        }
    }

    let dmg = {
        pendingShots: pendingShots,
        setPendingShots: setPendingShots,
        denied: denied,
        setDenied: setDenied,
        disputed: disputed,
        setDisputed: setDisputed,
        confirm: (shot) => {
            ws.send({ cmd: 'confirm', type: shot.type, player: shot.player });
            setPendingShots(pending => remove(pending, (p) => p.player === shot.player));
        },

        deny: (shot) => {
            ws.send({ cmd: 'deny', type: shot.type, player: shot.player });
            setPendingShots(pending => remove(pending, (p) => p.player === shot.player));
        },

        fire: (type, p) => ws.send({ cmd: 'fire', type: type, target: p }),

        acceptDeny: (d) => {
            console.log(d);
            setDenied(denied => remove(denied, deny => deny.target === d.target));
        },

        escalate: (d) => {
            ws.send({ cmd: 'dispute', type: d.type, target: d.player });
            setDenied(denied, remove(denied, deny => deny.target === d.target));
        },

        vote: (d, v) => {
            ws.send({
                cmd: 'vote',
                type: d.type,
                player: d.player,
                target: d.target,
                hit: v,
            });
            remove(disputed, (s) => s.target === d.target && s.player === d.player);
        },
    };

    return (
        <>
            {denied.map((d) => (
                <Deny type={d.type} target={d.player} key={d.player}
                    close={dmg.acceptDeny.bind(null, d)}
                    escalate={dmg.escalate.bind(null, d)} />))}
            {context.pending_shots && context.pending_shots.map((s) => (
                <ConfirmShot player={context.me} shot={s} key={s.player}
                    confirm={dmg.confirm.bind(null, s)}
                    deny={dmg.deny.bind(null, s)} />
            ))}
            {context.disputed && context.disputed.map((d) => (
                <Dispute shot={d} key={d.player} vote={dmg.vote.bind(this, d)} />
            ))}
        </>
    )

}
