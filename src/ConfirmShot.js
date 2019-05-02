import { ws, GameContext, LASER_OPTION } from './Util';
import React, { Component } from 'react';
import { Badge, Button } from './UI';
import Modal from './Modal';
import { Option } from './Option';

var damage_weapons = {
    'laser': true,
    'Mini Howitzer': true,
    'Rear-Firing Laser': true,
};

let btnStyle = {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

let optStyle = { height: "30px" };

export default class ConfirmShot extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.cancel = this.cancel.bind(this);
    }

    ask(opt) {
        this.setState({ discard: opt });
    }

    cancel() {
        this.setState({ discard: null });
    }

    discard(opt) {
        const shot = this.props.shot;
        ws.send({
            cmd: 'discard',
            type: shot.type,
            player: shot.player,
            option: opt.name
        });
    }

    discardable() {
        if (!damage_weapons[this.props.shot.type]) {
            return null;
        }

        let opts = this.props.player.options;
        const self = this;
        return Object.keys(opts).map(function (k) {
            let o = opts[k];
            return (
                <Button onClick={self.ask.bind(self, o)} key={o.name} style={btnStyle}>
                    <Option card={o} style={optStyle} />
                    Discard {o.name} to prevent 1 damage?
                </Button>)
        });
    }

    confirmation() {
        const o = this.state.discard;
        if (!o) {
            return null;
        }
        return (
            <Modal title={"Discard " + o.name + "?"} closeText="Cancel"
                close={this.cancel}>
                <Option card={o} style={optStyle} />
                Are you sure you want to discard {o.name}?
                <Button onClick={this.discard.bind(this, o)} style={btnStyle}>
                    Discard
                </Button>
            </Modal>);
    }

    render() {
        const target_action = this.props.shot.type === 'Ramming Gear' ? 'rammed' : 'shot';
        const action = this.props.shot.type === 'Ramming Gear' ? 'used' : 'fired';
        let style = { height: "2em" };
        let player = GameContext.public.player[this.props.shot.player];
        let card = player['options'][this.props.shot.type];
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
            <Modal title={title} closeText="Deny" close={this.props.deny} z="100">
                <span style={{ paddingTop: '8px', margin: 'auto' }}>
                    {player.name} {action} {this.props.shot.type}
                </span>
                <Button onClick={this.props.confirm} bg="green">
                    Confirm
                </Button>
                {this.confirmation()}
            </Modal>);
    }
}

