import Footer from 'rebass/src/Footer';
import Button from 'rebass/src/Button';
import state from './State';

export default class Waiting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players:this.players()};
    }
    ready(r) {
        this.props.ws.send({cmd: r ? 'not_ready' : 'ready'});
    }
    render() {
    return (
<div>
    {this.state.players}
    <Footer>
	<Button theme={state.me.ready?'success':'error'}
        onClick={this.ready.bind(this, state.me.ready)}>
		{state.me.ready?'Ready':'Not Ready'}
	</Button>
    </Footer>
</div>
    )}

    on_ready(msg) { this.setState({players:this.players()}); }

    on_not_ready(msg) { this.setState({players:this.players()}); }

    on_join(msg) { this.setState({players:this.players()}); }

    on_quit(msg) { this.setState({players:this.players()}); }

    players() {
        var player = state.game.player;
        const keys = Object.keys(player).sort();
        return keys.map(function(id) {
            const p = player[id];
            return (
            <Button key={id} theme={p.ready?'success':'error'}>
                {p.name} - {p.ready?'Ready':'Not Ready'}
            </Button> )
        })
    }
}

