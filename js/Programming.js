import MovementCard from './MovementCard';
import Register from './Register';
import { Box, ButtonCircle, Panel, PanelHeader, Shutdown } from './Widgets';

export default class Programming extends React.Component {
    constructor(props) {
        super(props);
        const keys = Object.keys(props.players);
        const cards = gs.private.cards || []
        if (!gs.private.registers) {
            var reg = [];
            for (var i=0; i<5; i++) {
                reg.push({damaged:0,program:[]});
            }
            gs.private.registers = reg;
        }
        this.state={
            cards: cards.sort((a,b)=>b.priority-a.priority),
            registers: gs.private.registers.clone()
        };
        this.ready = this.ready.bind(this);
        this.update_used(this.state.registers);
    }

    on_programming(msg) {
        var cards = [];
        if (msg.cards) {
            cards = msg.cards.sort((a,b)=>b.priority-a.priority);
        }
        gs.private.cards = cards;
        this.used = {};
        this.setState({
            cards: cards,
            registers: msg.registers
        });
    }

    update_used(registers) {
        this.used = {};
        for (var r of registers) {
            for (var c of r.program) {
                this.used[c.priority] = true;
            }
        }
    }

    on_program(msg) {
        gs.private.registers = msg.registers;
        this.update_used(msg.registers);
        this.setState({registers:msg.registers.clone()});
    }

    on_error(msg) {
        this.update_used(gs.private.registers);
        this.setState({registers:gs.private.registers.clone()});
    }

    choose(card) {
        const registers = this.state.registers;
        const reg = registers.map((r)=>r.program);
        const r = reg.find((r)=>r.length==0);
        if (r) {
            r[0] = card;
            this.update_used(registers);
            this.setState({registers:registers});
            ws.send({ cmd:'program', registers:reg });
        }
    }

    clear(r) {
        const registers = this.state.registers;
        registers[r].program = [];
        const reg = registers.map((r)=>r.program);
        this.update_used(registers);
        this.setState({registers:registers});
        ws.send({ cmd:'program', registers:reg });
    }

    ready() {
        ws.send({cmd: 'ready'});
    }

    render() {
        if (this.props.players[gs.id].shutdown) {
            return <Shutdown/>;
        }
        const registers = this.state.registers.map(
            (r, i) => <Register register={r} key={i}
                        onClick={this.clear.bind(this, i)}/>);
        const cards = this.state.cards.map(
            (c) => <MovementCard card={c} key={c.priority}
                        inactive={this.used[c.priority]}
                        onClick={this.choose.bind(this,c)}/>);
        return (
<div>
  <Panel mb={12}>
    <PanelHeader bg="orange">Registers</PanelHeader>
    <Box p={3} mb={12}>{registers}</Box>
  </Panel>
  <Panel mb={12}>
    <PanelHeader bg="blue">Movement Options</PanelHeader>
    <Box p={3} mb={12}>{cards}</Box>
  </Panel>
  <ButtonCircle bg={this.props.me.ready?'red':'green'} onClick={this.ready}>
    {this.props.me.ready?'Not Ready':'Ready'}
  </ButtonCircle>
</div>
    )}
}

