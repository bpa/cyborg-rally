import { Button } from './Widgets';
import Card from './Card.js';
import Modal from './Modal.js';
import Option from './Option.js';

var damage_weapons = {
    'laser':             true,
    'Mini Howitzer':     true,
    'Rear-Firing Laser': true,
};

let btnStyle = {
    textAlign:'center',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
};

let optStyle = {height: "30px"};

export default class FireType extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.cancel = this.cancel.bind(this);
    }

    ask(opt) {
        this.setState({discard: opt});
    }

    cancel() {
        this.setState({discard: null});
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
        return Object.keys(opts).map(function(k) {
            let o = opts[k];
            return (
<Button onClick={self.ask.bind(self, o)} key={o.name} style={btnStyle}>
    <Option card={o} style={optStyle}/>
    Discard {o.name} to prevent 1 damage?
</Button>)});
    }

    confirmation() {
        const o = this.state.discard;
        if (!o) {
            return null;
        }
        return (
            <Modal title={"Discard "+o.name+"?"} closeText="Cancel"
                close={this.cancel}>
                <Option card={o} style={optStyle}/>
                Are you sure you want to discard {o.name}?
                <Button onClick={this.discard.bind(this, o)} style={btnStyle}>
                    Discard
                </Button>
            </Modal>);
    }

    render() {
        let name = gs.public.player[this.props.shot.player].name;
        return (
<Modal title={"Confirm shot by " + name} closeText="Deny" close={this.props.deny} z="100">
    <Button onClick={this.props.confirm} bg="green">
        Confirm
    </Button>
    {this.discardable()}
    {this.confirmation()}
</Modal>);
    }
}

