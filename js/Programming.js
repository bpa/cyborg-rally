import Button from 'rebass/src/Button';
import MovementCard from './MovementCard';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Register from './Register';
import state from './State';

export default class Programming extends React.Component {
    constructor(props) {
        super(props);
        const player = state.public.player;
        const keys = Object.keys(player);
        const cards = state.private.cards || []
        if (!state.private.registers) {
            var reg = [];
            for (var i=0; i<5; i++) {
                reg.push({damaged:0,program:[]});
            }
            state.private.registers = reg;
        }
        this.state={
            cards: cards.sort((a,b)=>b.priority-a.priority),
            registers: state.private.registers,
        };
        this.ready = this.ready.bind(this);
    }

    on_programming(msg) {
        const cards = msg.cards.sort((a,b)=>b.priority-a.priority);
        state.private.cards = cards;
        this.setState({
            cards: cards,
            registers: msg.registers
        });
    }

    on_program(msg) {
        this.setState({registers:msg.registers});
    }

    choose(card) {
        const reg = this.state.registers.map((r)=>r.program);
        const r = reg.find((r)=>r.length==0);
        if (r) {
            r[0] = card;
            this.props.ws.send({ cmd:'program', registers:reg });
        }
    }

    clear(r) {
        const reg = this.state.registers.map((r)=>r.program);
        reg[r] = [];
        this.props.ws.send({ cmd:'program', registers:reg });
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
  <Panel theme="warning">
    <PanelHeader>Registers</PanelHeader>
    {registers}
  </Panel>
  <Panel theme="info">
    <PanelHeader>Movement Options</PanelHeader>
    {cards}
  </Panel>
  <Button theme={state.me.ready?'error':'success'} onClick={this.ready}>
    {state.me.ready?'Not Ready':'Ready'}
  </Button>
</div>
    )}
}

