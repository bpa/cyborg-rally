import Button from 'rebass/src/Button';
import Card from 'rebass/src/Card';
import Checkbox from 'rebass/src/Checkbox';
import Heading from 'rebass/src/Heading';
import Input from 'rebass/src/Input';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Radio from 'rebass/src/Radio';

export default class CreateGame extends React.Component {
	constructor(p) {
		super(p);
		this.timerOption = this.timerOption.bind(this);
		this.state = {
            timer: '1st+30s',
            conveyors: true,
            board_lasers: true,
            express_conveyors: false,
            pushers: false,
            gears: false,
            start_with_4_lives: false,
            start_with_2_damage: false,
            choose_1_of_3_options: false,
            start_with_option: false,
            no_power_down: false,
            option_for_heal: false,
        };
        this.create = this.create.bind(this);
	}

	timerOption(e) {
		this.setState({timer: e.target.value});
	}

    check(field) {
        let state = {};
        state[field] = !this.state[field];
        this.setState(state);
    }

    create() {
        if (this.name.value) {
            let msg = Object.assign({cmd: 'create_game', name: this.name.value}, this.state);
            delete msg['error'];
            this.props.ws.send(msg);
        }
        else {
            this.setState({error: 'Name is required'});
            this.name.focus();
        }
    }

    on_create_game(msg) {
        if (this.name.value === msg.name) {
            this.props.ws.send({cmd: 'join', name: msg.name});
        }
    }

    on_error(msg) {
        this.setState({error: msg.error});
    }

	render() { return (
<Panel theme="info">
	<PanelHeader>Create Game</PanelHeader>
	<Input label="Name" name="name" placeholder="Game Name" 
        message={this.state.error} baseRef={r=>this.name=r}/>
	<Card>
        <Heading>Timer options</Heading>
	<Radio name="timer" checked={this.state.timer==='standard'} onChange={this.timerOption} label="Standard (30 seconds after penultimate completion)" value='standard'/>
	<Radio name="timer" checked={this.state.timer==='1st+30s'} onChange={this.timerOption} label="Fast (30 seconds after first player finishes)" value='1st+30s'/>
	<Radio name="timer" checked={this.state.timer==='1m'} onChange={this.timerOption} label="Faster (1 minute)" value="1m"/>
	<Radio name="timer" checked={this.state.timer==='30s'} onChange={this.timerOption} label="Fastest (30 seconds)" value="30s"/>
    </Card>
	<Card>
        <Heading>Active Elements</Heading>
	    <Checkbox theme="success" name="l" label="Board lasers" checked={this.state.board_lasers} onClick={this.check.bind(this, 'board_lasers')} readOnly/>
	    <Checkbox theme="success" name="c" label="Conveyor Belts" checked={this.state.conveyors} onClick={this.check.bind(this, 'conveyors')} readOnly/>
	    <Checkbox theme="success" name="e" label="Express Conveyor Belts" checked={this.state.express_conveyors} onClick={this.check.bind(this, 'express_conveyors')} readOnly/>
	    <Checkbox theme="success" name="p" label="Pushers" checked={this.state.pushers} onClick={this.check.bind(this, 'pushers')} readOnly/>
	    <Checkbox theme="success" name="g" label="Gears" checked={this.state.gears} onClick={this.check.bind(this, 'gears')} readOnly/>
    </Card>
	<Card>
        <Heading>Special Rules</Heading>
	    <Checkbox theme="success" name="4" label="All robots start with 4 Lives" checked={this.state.start_with_4_lives} onClick={this.check.bind(this, 'start_with_4_lives')} readOnly/>
	    <Checkbox theme="success" name="2" label="All robots start with 2 Damage" checked={this.state.start_with_2_damage} onClick={this.check.bind(this, 'start_with_2_damage')} readOnly/>
	    <Checkbox theme="success" name="1" label="All robots start with one option" checked={this.state.start_with_option} onClick={this.check.bind(this, 'start_with_option')} readOnly/>
	    <Checkbox theme="success" name="3" label="All robots choose from one of three options" checked={this.state.choose_1_of_3_options} onClick={this.check.bind(this, 'choose_1_of_3_options')} readOnly/>
	    <Checkbox theme="success" name="x" label="Robots can't power down" checked={this.state.no_power_down} onClick={this.check.bind(this, 'no_power_down')} readOnly/>
	    <Checkbox theme="success" name="o" label="Wrench/flag gives option card instead of repairing" checked={this.state.option_for_heal} onClick={this.check.bind(this, 'option_for_heal')} readOnly/>
    </Card>
    <Button theme="primary" onClick={this.create}>Create Game</Button>
    <Button theme="error" onClick={this.props.back}>Nevermind</Button>
</Panel>
	)}
}

