import { GameContext } from './Util';
import React, { Component } from 'react';
import { Button } from './UI';
import Modal from './Modal.js';

export default class Deny extends Component {
    render() {
        let name = GameContext.public.player[this.props.target].name;
        return (
            <Modal title={name + " denies your shot"}
                closeText="Accept denial" close={this.props.close}>
                <Button onClick={this.props.escalate} bg="green">
                    I totally shot {name}
                </Button>
            </Modal>);
    }
}

