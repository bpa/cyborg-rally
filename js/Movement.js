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

    player(bot) {
        const p = state.public.player[bot.player];
        return (
<Container key={bot.player} theme={p.ready?'success':'error'}>
  <Register theme="default" register={bot}/>
  {p.name} - {p.ready?'Ready':'Not Ready'}
</Container> )
    }

    render() {
    return (
<div>
    {this.state.order.map(this.player)}
    <Footer>
	<Button theme={state.me.ready?'success':'error'}
        onClick={this.ready.bind(this, state.me.ready)}>
		{state.me.ready?'Ready':'Not Ready'}
	</Button>
    </Footer>
</div>
    )}
}
