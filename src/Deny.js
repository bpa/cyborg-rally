import { GameContext } from './Util';
import React, { useContext } from 'react';
import { Button } from './UI';
import Modal from './Modal.js';

export default function Deny(props) {
    let context = useContext(GameContext);
    let name = context.public.player[props.target].name;
    return (
        <Modal title={name + " denies your shot"}
            closeText="Accept denial" close={props.close}>
            <Button onClick={props.escalate} bg="green">
                I totally shot {name}
            </Button>
        </Modal>);
}

