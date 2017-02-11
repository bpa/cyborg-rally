import Footer from 'rebass/src/Footer';
import Button from 'rebass/src/Button';
import Players from './Players';
import Ready from './Ready';
import state from './State';

export default class Waiting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players: state.public.player};
    }
    render() {
        return (
<div>
	<Ready {...this.props} ready={state.me.ready}/>
    <hr/>
    <Players {...this.props} players={this.state.players}/>
</div>
    )}

    on_ready(msg) { this.setState({players:state.public.player}); }

    on_not_ready(msg) { this.setState({players:state.public.player}); }

    on_join(msg) { this.setState({players:state.public.player}); }

    on_quit(msg) { this.setState({players:state.public.player}); }
}

