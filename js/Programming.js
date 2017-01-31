import MovementCard from './MovementCard';
import Register from './Register';
import state from './State';

export default class Programming extends React.Component {
    constructor(props) {
        super(props);
        const player = state.game.player;
        const keys = Object.keys(player);
        console.warn(state);
        this.state={
            cards: state.my.cards,
            registers: state.my.registers,
            ready: keys.reduce(function(t, p) { player[p].ready ? t + 1 : t }, 0)
        };
        this.ready = this.ready.bind(this);
    }

    ready() {
        this.props.ws.send({cmd: 'ready'});
    }

    on_ready() {
        const r = this.state.ready;
        this.setState({ready: r+1});
    }

    render() {
        const registers = this.state.registers.map(
            (r, i) => <Register register={r} key={i}/>);
        const cards = this.state.cards.map(
            (c) => <MovementCard card={c} key={c.priority}/>);
        return <MovementCard/>
    }

    on_ready(msg) {
        this.setState({game:game});
    }
}

