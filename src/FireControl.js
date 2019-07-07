import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useReducer, useState } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import { Badge, Button, Panel } from './UI';
import OptionModal from './OptionModal';

function updateHelp(old, action) {
    if (action === 'show') {
        return { help: true };
    }
    else if (action === 'hide') {
        return { help: false };
    }
    else if (action === 'toggle') {
        return { help: !!old.help };
    }
    return { show: action };
}

export default function FireControl(props) {
    let context = useContext(GameContext);
    let [help, setHelp] = useReducer(updateHelp, {});
    let [card, setCard] = useState(false);
    let [fireControl, setFireControl] = useState(() => {
        if (context.state && context.me.options['Fire Control']) {
            return context.state['Fire Control'];
        }
    });

    useMessages({
        fire_control: (msg) => {
            setFireControl(msg.target);
        }
    });

    function fire() {
        let type = Number.isInteger(card) ? 'register' : 'option';
        ws.send({
            cmd: 'fire_control',
            target: props.target,
            [type]: card,
        })
    }

    function options() {
        let player = context.public.player[props.target];
        const options = player.options;
        const keys = Object.keys(options).sort();
        if (keys.length === 0) {
            return null;
        }
        const icons = keys.map((o, i) => {
            if (help.show) {
                return <Icon option={options[o]} key={i} help
                    onClick={() => setHelp(o)} />;
            }
            if (card === o) {
                return <Icon option={options[o]} key={i} selected
                    onClick={() => setCard(false)} />;
            }
            return <Icon option={options[o]} key={i}
                onClick={() => setCard(o)} />;
        });

        return (
            <Panel color="accent-1" header={
                <div>
                    Options
                    <span style={{ position: 'absolute', right: '' }}>
                        <Badge onClick={() => setHelp('toggle')}>?</Badge>
                    </span>
                </div>
            }>
                {icons}
                <Button
                    onClick={() => fire()} >
                    Discard Option
                </Button >
            </Panel >
        );
    }

    function register(r, i) {
        var name = r.program.reduce((a, b) => a + b.name, '');
        if (r.locked) {
            return <Icon locked card={{ name: name }} key={i} />
        }

        if (i === card) {
            return <Icon selected key={i}
                onClick={() => setCard(false)}
                card={{ name: name }} />
        }

        return (
            <Icon key={i}
                onClick={() => setCard(i)}
                card={{ name: name }} />
        )
    }

    if (!props.target) {
        return null;
    }

    let player = context.public.player[props.target];

    const cards = player.registers.map(register.bind(this));
    let cardHelp = player.options[help.show];

    let modal = cardHelp !== undefined
        ? <OptionModal card={cardHelp} done={() => setHelp('close')} />
        : null;

    return (
        <Modal title="Fire Control" closeText="Nevermind, use main laser" close={props.onSelect}>
            <Panel color="accent-2" title="Registers">
                {cards}
                <Button
                    onClick={() => fire()}>
                    Lock Register
                </Button>
            </Panel>
            {options()}
            {modal}
        </Modal>
    );
}
