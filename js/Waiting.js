import Footer from 'rebass/src/Footer';
import Button from 'rebass/src/Button';
import state from './State';

export default class Waiting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players:this.players()};
        this.ready = this.ready.bind(this);
        this.not_ready = this.not_ready.bind(this);
    }
    not_ready() {
        this.props.ws.send({cmd: 'not_ready'});
    }
    ready() {
        this.props.ws.send({cmd: 'ready'});
    }
    render() {
        const btn
            = !state.me.ready ?
                <Button theme="success" onClick={this.ready}>Ready</Button>
            : state.public.state === 'Waiting' ?
                <Button theme="error" onClick={this.not_ready}>Not Ready</Button>
            :   <Button theme="success">Waiting...</Button>;
                
        return (
<div>
	{btn}
    <hr/>
    {this.state.players}
</div>
    )}

    on_state(msg) { this.setState({players:this.players()}); }

    on_ready(msg) { this.setState({players:this.players()}); }

    on_not_ready(msg) { this.setState({players:this.players()}); }

    on_join(msg) { this.setState({players:this.players()}); }

    on_quit(msg) { this.setState({players:this.players()}); }

    players() {
        var player = state.public.player;
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

