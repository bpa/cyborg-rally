import Ready from './Ready';
import Player from './Player';
import { Shutdown } from './Emoji';

export default class Movement extends React.Component {
    constructor(props) {
        super(props);
        this.state = { order:gs.state || [] };
    }
    
    on_move(msg) {
        this.setState({order:msg.order});
    }

    render() {
        const players = this.props.players;
        if (players[gs.id].shutdown) {
            return <Shutdown/>
        }
        return (
<div>
    <Ready ready={this.props.me.ready}/>
    <hr/>
    {this.state.order.map((o) =>
        <Player player={players[o.player]} key={o.player} register={o}/>)}
</div>
    )}
}
