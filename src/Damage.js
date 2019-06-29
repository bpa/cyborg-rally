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
                    <Button key={id} bg='black' color="red" onClick={() => props.onClick(id)}>
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
    var [pendingShots, setPendingShots] = useState(() => {
        let shots = [];
        if (context.state && context.state.shots) {
            for (var shot of context.state.shots) {
                if (shot.target === context.id) {
                    /*eslint no-loop-func: "off"*/
                    shots.push({ player: shot.player, type: shot.type });
                }
            }
        }
        return shots;
    });

    var [denied, setDenied] = useState([]);
    var [disputed, setDisputed] = useState(() => {
        let disputed = [];
        if (context.state && context.state.shots) {
            for (var shot of context.state.shots) {
                if (shot.dispute) {
                    if (shot.voted[context.id] === undefined) {
                        disputed.push(shot);
                    }
                }
            }
        }
        return disputed;
    });

    useMessages({
        fire: (msg) => {
            pendingShots.push(msg);
            setPendingShots(pendingShots);
        },
        confirm: (msg) => setPendingShots(pend => remove(pend, p => p.player === msg.player)),
        deny: (msg) => {
            if (Object.keys(context.public.player).length > 2) {
                denied.push({ player: msg.player, type: msg.type });
                setDenied(denied);
            }
        },
        dispute: (msg) => setDisputed(disputed => disputed.push(msg)),
        resolution: (msg) => setDisputed(disputed => remove(disputed, s => s.target === msg.target && s.player === msg.player)),
        ram: msg => setPendingShots(pending => pending.push({ player: msg.player, type: 'Ramming Gear' })),
    });

    function confirm(shot) {
        ws.send({ cmd: 'confirm', type: shot.type, player: shot.player });
        remove(pendingShots, (p) => p.player === shot.player);
        setPendingShots(pendingShots);
    }

    function deny(shot) {
        ws.send({ cmd: 'deny', type: shot.type, player: shot.player });
        remove(pendingShots, (p) => p.player === shot.player);
        setPendingShots(pendingShots);
    }

    function fire(type, p) {
        ws.send({ cmd: 'fire', type: type, target: p });
    }

    function acceptDeny(d) {
        setDenied(denied => remove(denied, deny => deny.target === d.target));
    }

    function escalate(d) {
        ws.send({ cmd: 'dispute', type: d.type, target: d.player });
        setDenied(denied => remove(denied, deny => deny.target === d.target));
    }

    function vote(d, v) {
        ws.send({
            cmd: 'vote',
            type: d.type,
            player: d.player,
            target: d.target,
            hit: v,
        });
        remove(disputed, (s) => s.target === d.target && s.player === d.player);
    }

    return (
        <>
            {denied.map((d) => (
                <Deny type={d.type} target={d.player} key={d.player}
                    close={acceptDeny.bind(null, d)}
                    escalate={escalate.bind(null, d)} />))}
            {pendingShots.map((s) => (
                <ConfirmShot player={context.me} shot={s} key={s.player}
                    confirm={confirm.bind(null, s)}
                    deny={deny.bind(null, s)} />
            ))}
            {disputed && disputed.map((d) => (
                <Dispute shot={d} key={d.player} vote={vote.bind(this, d)} />
            ))}
        </>
    )

}
