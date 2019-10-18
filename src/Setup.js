import { ws, GameContext, useMessages } from './Util';
import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Panel, Content, Button } from './UI';
import Players from './Players';
import Icon from './Icon';
import OptionModal from './OptionModal';

export default observer(() => {
    let context = useContext(GameContext);
    let [show, setShow] = useState(undefined);
    let [showHelp, setShowHelp] = useState(false);
    let [selected, setSelected] = useState(undefined);

    function closeHelp() {
        setShow(undefined);
        setShowHelp(false);
    }

    function toggleHelp() {
        setShowHelp(help => !help);
    }

    function choice(option) {
        var className = showHelp ? "help" : option === selected ? "selected" : "add-on";
        var onClick = showHelp ? () => setShow(option) : () => setSelected(option);
        return <Icon key={option.name} option={option} onClick={onClick} className={className} />;
    }

    function choose_option() {
        ws.send({ cmd: 'choose', option: selected.name });
    }

    useMessages({
        pick: msg => context.private = { options: msg.options },
    });

    if (context.me.ready) {
        return (
            <Content>
                <Players />
            </Content>
        )
    }

    if (context.private.options === undefined) {
        context.private.options = [];
    }

    let btn = selected ? <Button ready onClick={choose_option}>Select</Button>
        : <Button>Choose a card...</Button>;

    return (
        <Content>
            <Panel background="accent-1" title="Choose One" onHelp={toggleHelp} direction="row">
                {context.private.options.map(choice)}
                <OptionModal card={show} done={closeHelp} />
            </Panel>
            {btn}
        </Content>
    );
});
