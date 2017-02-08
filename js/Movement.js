import Button from 'rebass/src/Button';
import Card from 'rebass/src/Card';
import Container from 'rebass/src/Container';
import Footer from 'rebass/src/Footer';
import Message from 'rebass/src/Message';
import Register from './Register';
import state from './State';

export default class Movement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {order:state.state || []};
        this.ready = this.ready.bind(this);
    }
    
    on_move(msg) {
        this.setState({order:msg.order});
    }

    ready() {
        this.props.ws.send({cmd: 'ready'});
    }

    on_ready(msg) {
        this.setState({order:msg.order});
    }

    players() {
        if (this.state.order.map) {
            return this.state.order.map(this.player);
        }
        else {
            return <div/>
        }
    }
    player(bot) {
        const p = state.public.player[bot.player];
        return (
<Container key={bot.player} theme={p.ready?'success':'error'}>
  <Register theme="default" register={bot}/>
  {p.name} - {p.ready?'Ready':'Not Ready'}
</Container> )
    }

    render() { return (
        <div>
            <Button theme="success" onClick={this.ready}>
                {state.me.ready ? 'Waiting...' : 'Ready'}
            </Button>
            <hr/>
            {this.players()}
        </div>
    )}
}
