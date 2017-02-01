import MovementCard from './MovementCard';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Register from './Register';
import state from './State';

export default class Programming extends React.Component {
    constructor(props) {
        super(props);
        const player = state.game.player;
        const keys = Object.keys(player);
        const cards = state.private.cards || []
        if (!state.private.registers) {
            var reg = [];
            for (var i=0; i<5; i++) {
                reg.append({damaged:0,program:[]});
            }
            state.private.registers = reg;
        }
        this.state={
            cards: cards.sort((a,b)=>b.priority-a.priority),
            registers: state.private.registers,
        };
        console.log(this.state);
        this.ready = this.ready.bind(this);
    }

    on_programming(msg) {
        const cards = msg.cards.sort((a,b)=>b.priority-a.priority);
        state.private.cards = cards;
        this.setState({cards: cards});
    }

    on_program(msg) {
        this.setState({registers:msg.registers});
    }

    choose(card) {
        const reg = this.state.registers.slice(0);
        const r = reg.find((r)=>r.program.length==0);
        if (r) {
            r.program[0] = card;
            this.props.ws.send({
                cmd:'program',
                registers:reg.map((r)=>r.program),
            });
        }
    }

    clear(r) {
    }

    ready() {
        this.props.ws.send({cmd: 'ready'});
    }

    render() {
        const registers = this.state.registers.map(
            (r, i) => <Register register={r} key={i}
                        onClick={this.clear.bind(this, i)}/>);
        const cards = this.state.cards.map(
            (c) => <MovementCard card={c} key={c.priority}
                        onClick={this.choose.bind(this,c)}/>);
        return (
<div>
  <Panel theme="success">
    <PanelHeader>Registers</PanelHeader>
    {registers}
  </Panel>
  <Panel theme="info">
    <PanelHeader>Movement Options</PanelHeader>
    {cards}
  </Panel>
</div>
    )}
}

