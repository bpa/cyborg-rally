import { ws, GameContext, useMessages } from './Util';
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
                    <Button target key={id} onClick={() => props.onClick(id)}>
                        <div><Sight /> {p.name} <Sight></Sight></div>
                    </Button>)
            }
        });
    return <>{keys}</>;
}

export default function Damage() {
    var context = useContext(GameContext);
    var [pendingShots, setPendingShots] = useState(() => {
        let shots = [];
        if (context.state && context.state.shots) {
            for (var shot of context.state.shots) {
                if (shot.target === context.id && !shot.dispute) {
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
            setPendingShots(p => p.concat(msg));
        },
        confirm: (msg) => setPendingShots(pend => pend.filter(p => p.player !== msg.player)),
        deny: (msg) => {
            if (Object.keys(context.public.player).length > 2) {
                setDenied(d => d.concat({ player: msg.player, type: msg.type }));
            }
        },
        dispute: (msg) => setDisputed(disputed => disputed.concat(msg)),
        resolution: (msg) => setDisputed(disputed => disputed.filter(s => s.target !== msg.target && s.player !== msg.player)),
        ram: msg => setPendingShots(p => p.concat({ player: msg.player, type: 'Ramming Gear' })),
    });

    function confirm(shot) {
        ws.send({ cmd: 'confirm', type: shot.type, player: shot.player });
        setPendingShots(pending => pending.filter(p => p.player !== shot.player));
    }

    function deny(shot) {
        ws.send({ cmd: 'deny', type: shot.type, player: shot.player });
        setPendingShots(pending => pending.filter(p => p.player !== shot.player));
    }

    function acceptDeny(d) {
        setDenied(denied => denied.filter(deny => deny.target !== d.target));
    }

    function escalate(d) {
        ws.send({ cmd: 'dispute', type: d.type, target: d.player });
        setDenied(denied => denied.filter(deny => deny.target !== d.target));
    }

    function vote(d, v) {
        ws.send({
            cmd: 'vote',
            type: d.type,
            player: d.player,
            target: d.target,
            hit: v,
        });
        setDisputed(disputed => disputed.filter(s => s.target !== d.target && s.player !== d.player));
    }

    return (
        <>
            {denied.map((d) => (
                <Deny type={d.type} target={d.player} key={d.player}
                    close={acceptDeny.bind(null, d)}
                    escalate={escalate.bind(null, d)} />))}
            {pendingShots.map((s) => (
                <ConfirmShot shot={s} key={s.player}
                    confirm={confirm.bind(null, s)}
                    deny={deny.bind(null, s)} />
            ))}
            {disputed && disputed.map((d) => (
                <Dispute shot={d} key={d.player} vote={vote.bind(this, d)} />
            ))}
        </>
    )

}
