import { ws, GameContext, LASER_OPTION } from './Util';
import React, { useContext, useState } from 'react';
import { Badge, Button } from './UI';
import Modal from './Modal';
import { Option } from './Option';

let btnStyle = {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

let optStyle = { height: "30px" };

export default function ConfirmShot(props) {
    let context = useContext(GameContext);
    let [choice, setChoice] = useState(false);

    function discard(opt) {
        const shot = props.shot;
        ws.send({
            cmd: 'discard',
            type: shot.type,
            player: shot.player,
            option: opt.name
        });
    }

    function confirmation() {
        if (!choice) {
            return null;
        }
        return (
            <Modal title={"Discard " + choice.name + "?"} closeText="Cancel"
                close={() => setChoice(false)}>
                <Option card={choice} style={optStyle} />
                Are you sure you want to discard {choice.name}?
                <Button onClick={() => discard(choice)} style={btnStyle}>
                    Discard
                </Button>
            </Modal>);
    }

    const target_action = props.shot.type === 'Ramming Gear' ? 'rammed' : 'shot';
    const action = props.shot.type === 'Ramming Gear' ? 'used' : 'fired';
    let style = { height: "2em" };
    let player = context.public.player[props.shot.player];
    let card = player['options'][props.shot.type];
    if (card === undefined) {
        card = LASER_OPTION;
    }
    let title =
        <div>
            <Badge bg="blue">
                <Option card={card} style={style} />
            </Badge>
            <span style={{ margin: 'auto' }}>You have been {target_action}</span>
        </div>;
    return (
        <Modal title={title} closeText="Deny" close={props.deny} z="100">
            <span style={{ paddingTop: '8px', margin: 'auto' }}>
                {player.name} {action} {props.shot.type}
            </span>
            <Button onClick={props.confirm} bg="green">
                Confirm
            </Button>
            {confirmation()}
        </Modal>);
}

