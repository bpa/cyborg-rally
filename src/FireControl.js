import { ws, GameContext } from './Util';
import React, { Component } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import { Badge, Button, Panel } from './UI';
import OptionModal from './OptionModal';

export default class FireControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showHelp: false,
        }
    }

    select(card, type) {
        this.setState({ card: card, type: type });
    }

    fire() {
        ws.send({
            cmd: 'fire_control',
            target: this.props.target,
            [this.state.type]: this.state.card,
        })
    }

    fire_laser() {

    }

    closeHelp() {
        this.setState({ show: undefined });
    }

    openHelp(option) {
        this.setState({ show: option, showHelp: false });
    }

    toggleHelp() {
        let show = !this.state.showHelp;
        this.setState({ showHelp: show });
    }

    options() {
        let player = GameContext.public.player[this.props.target];
        const options = player.options;
        const keys = Object.keys(options).sort();
        if (keys.length === 0) {
            return null;
        }
        const icons = keys.map((o, i) => {
            if (this.state.showHelp) {
                return <Icon option={options[o]} key={i} help
                    onClick={this.openHelp.bind(this, o)} />;
            }
            if (this.state.card === o) {
                return <Icon option={options[o]} key={i} selected
                    onClick={this.select.bind(this)} />;
            }
            return <Icon option={options[o]} key={i}
                onClick={this.select.bind(this, o, 'option')} />;
        });

        return (
            <Panel color="accent-1" header={
                <div>
                    Options
                    <span style={{ position: 'absolute', right: '' }}>
                        <Badge onClick={this.toggleHelp.bind(this)}>?</Badge>
                    </span>
                </div>
            }>
                {icons}
                <Button bg={this.state.type === 'option' ? 'blue' : 'gray'}
                    onClick={this.fire.bind(this)} >
                    Discard Option
                </Button >
            </Panel >
        );
    }

    register(r, i) {
        var name = r.program.reduce((a, b) => a + b.name, '');
        if (r.locked) {
            return <Icon locked card={{ name: name }} key={i} />
        }

        if (i === this.state.card) {
            return <Icon selected key={i}
                onClick={this.select.bind(this)}
                card={{ name: name }} />
        }

        return (
            <Icon key={i}
                onClick={this.select.bind(this, i, 'register')}
                card={{ name: name }} />
        )
    }

    render() {
        if (!this.props.target) {
            return null;
        }

        let player = GameContext.public.player[this.props.target];

        const cards = player.registers.map(this.register.bind(this));
        let card = player.options[this.state.show];

        let modal = card !== undefined
            ? <OptionModal card={card} done={this.closeHelp.bind(this)} />
            : null;

        return (
            <Modal title="Fire Control" closeText="Nevermind, use main laser" close={this.props.onSelect}>
                <Panel color="accent-2" title="Registrse">
                    {cards}
                    <Button bg={this.state.type === 'register' ? 'blue' : 'gray'}
                        onClick={this.fire.bind(this)}>
                        Lock Register
                    </Button>
                </Panel>
                {this.options()}
                {modal}
            </Modal>
        );
    }
}
