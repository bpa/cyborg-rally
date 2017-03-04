import Button from 'rebass/src/Button';
import Card from 'rebass/src/Card';
import Container from 'rebass/src/Container';
import Footer from 'rebass/src/Footer';
import Message from 'rebass/src/Message';
import Ready from './Ready';
import Register from './Register';

export default class Movement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {order:gs.state || []};
        this.ready = this.ready.bind(this);
        this.player = this.player.bind(this);
    }
    
    on_move(msg) {
        this.setState({order:msg.order});
    }

    ready() {
        ws.send({cmd: 'ready'});
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
        return (
<Container key={bot.player} theme={bot.ready?'success':'error'}>
  <Register theme="default" register={bot}/>
  {gs.public.player[bot.player].name} - {bot.ready?'Ready':'Not Ready'}
</Container> )
    }

    render() { return (
        <div>
            <Ready ready={this.props.me.ready}/>
            <hr/>
            {this.players()}
        </div>
    )}
}
