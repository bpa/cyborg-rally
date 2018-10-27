import Icon from './Icon';
import Modal from './Modal';
import { Circle, Panel } from 'rebass';
import OptionModal from './OptionModal';
import { Button, Content } from './Widgets';

export default class FireControl extends React.Component {
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
        let player = gs.public.player[this.props.target];
        const options = player.options;
        const keys = Object.keys(options).sort();
        if (keys.length == 0) {
            return null;
        }
        const icons = keys.map((o, i) => {
            if (this.state.showHelp) {
                return <Icon option={options[o]} key={i} help
                    onClick={this.openHelp.bind(this, o)} />;
            }
            if (this.state.card == o) {
                return <Icon option={options[o]} key={i} selected
                    onClick={this.select.bind(this)} />;
            }
            return <Icon option={options[o]} key={i}
                onClick={this.select.bind(this, o, 'option')} />;
        });

        return (
            <Panel mt={2}>
                <Panel.Header bg="green">
                    Options
                <span style={{ position: 'absolute', right: '' }}>
                        <Circle onClick={this.toggleHelp.bind(this)}>?</Circle>
                    </span>
                </Panel.Header>
                <Content flexDirection="row">{icons}</Content>
                <Content>
                    <Button bg={this.state.type == 'option' ? 'blue' : 'gray'}
                        onClick={this.fire.bind(this)}>
                        Discard Option
                    </Button>
                </Content>
            </Panel>
        );
    }

    register(r, i) {
        var name = r.program.reduce((a, b) => a + b.name, '');
        if (r.locked) {
            return <Icon locked card={{ name: name }} key={i} />
        }

        if (i == this.state.card) {
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

        let player = gs.public.player[this.props.target];

        const cards = player.registers.map(this.register.bind(this));
        let card = player.options[this.state.show];

        let modal = card !== undefined
            ? <OptionModal card={card} done={this.closeHelp.bind(this)} />
            : null;

        return (
            <Modal title="Fire Control" closeText="Nevermind, use main laser" close={this.props.onSelect}>
                <Panel mt={2}>
                    <Panel.Header bg="orange">Registers</Panel.Header>
                    <Content flexDirection="row">{cards}</Content>
                    <Content>
                        <Button bg={this.state.type == 'register' ? 'blue' : 'gray'}
                            onClick={this.fire.bind(this)}>
                            Lock Register
                        </Button>
                    </Content>
                </Panel>
                {this.options()}
                {modal}
            </Modal>
        );
    }
}
