import Footer from 'rebass/src/Footer';
import Button from 'rebass/src/Button';
import state from './State';

export default class Firing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players:this.players()};
        const keys = Object.keys(state.state);
        keys.map(function(k) {
            var p = state.state[k];
            if (p[0] && p[0].target === state.id) {
                props.ws.send({
                    cmd: 'confirm',
                    player: k,
                    type: p[0].type,
                    confirmed: true
                });
            }
        });
    }

    ready(r) {
        this.props.ws.send({cmd: r ? 'not_ready' : 'ready'});
    }

    fire(p) {
        this.props.ws.send({cmd: 'fire', type: 'laser', target: p});
    }

    on_fire(msg) {
        this.props.ws.send({
            cmd: 'confirm',
            player: msg.player,
            confirmed: true,
            type: msg.type
        });
    }

    render() {
    return (
<div>
    {this.state.players}
    <Footer>
	<Button theme={state.me.ready?'success':'error'}
        onClick={this.ready.bind(this, state.me.ready)}>
		{state.me.ready?'Waiting...':'No one in line of sight'}
	</Button>
    </Footer>
</div>
    )}

    on_ready(msg) { this.setState({players:this.players()}); }

    players() {
        var player = state.public.player;
        var self = this;
        const keys = Object.keys(player).sort().filter((p)=>p!=state.id);
        return keys.map(function(id) {
            const p = player[id];
            if (state.me.ready) {
            return (
            <Button key={id} theme={p.ready?'success':'error'}>
                {p.name} - {p.ready?'Ready':'Not Ready'}
            </Button> )
            } else {
            return (
            <Button key={id} theme='default' onClick={self.fire.bind(self, id)}>
                <font color="red">🞋 {p.name} 🞋</font>
            </Button> )
            }
        })
    }
}

