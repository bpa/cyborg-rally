import { Checkbox, Input, Label, Lead, Panel, Radio, Text } from 'rebass';
import { Button, Card, Content } from './Widgets';

export default class CreateGame extends React.Component {
	constructor(p) {
		super(p);
		this.timerOption = this.timerOption.bind(this);
		this.state = {
            timer: '1st+30s',
            conveyors: true,
            board_lasers: false,
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
        if (this.name) {
            let msg = Object.assign({cmd: 'create_game', name: this.name}, this.state);
            delete msg['error'];
            ws.send(msg);
        }
        else {
            this.setState({error: 'Name is required'});
            document.getElementById('name').focus();
        }
    }

    on_create_game(msg) {
        if (this.name === msg.name) {
            ws.send({cmd: 'join', name: msg.name});
        }
    }

    on_error(msg) {
        this.setState({error: msg.error});
    }

	render() { return (
<Panel>
	<Panel.Header bg="green">Create Game</Panel.Header>
    <Content>
        <Input autoFocus label="Name" id="name" placeholder="Game Name" 
            onChange={(r)=>this.name=r.target.value}/>
        <Text textAlign="center" fontWeight="bold" color="red">{this.state.error}</Text>
        <Card>
            <Text textAlign="center" fontWeight="bold" f={2}>Timer options</Text>
            <Label>
                <Radio name="timer" checked={this.state.timer==='standard'} onChange={this.timerOption} value='standard'/>
                Standard (30 seconds after penultimate completion)
            </Label>
            <Label>
                <Radio name="timer" checked={this.state.timer==='1st+30s'} onChange={this.timerOption} value='1st+30s'/>
                Fast (30 seconds after first player finishes)
            </Label>
            <Label>
                <Radio name="timer" checked={this.state.timer==='1m'} onChange={this.timerOption} value="1m"/>
                Faster (1 minute)
            </Label>
            <Label>
                <Radio name="timer" checked={this.state.timer==='30s'} onChange={this.timerOption} value="30s"/>
                Fastest (30 seconds)
            </Label>
        </Card>
        <Card>
            <Text textAlign="center" fontWeight="bold" f={2}>Active Elements</Text>
            <Label>
                <Checkbox name="l" checked={this.state.board_lasers} onClick={this.check.bind(this, 'board_lasers')} readOnly/>
                Board lasers
            </Label>
            <Label>
                <Checkbox name="c" checked={this.state.conveyors} onClick={this.check.bind(this, 'conveyors')} readOnly/>
                Conveyor Belts
            </Label>
            <Label>
                <Checkbox name="e" checked={this.state.express_conveyors} onClick={this.check.bind(this, 'express_conveyors')} readOnly/>
                Express Conveyor Belts
            </Label>
            <Label>
                <Checkbox name="p" checked={this.state.pushers} onClick={this.check.bind(this, 'pushers')} readOnly/>
                Pushers
            </Label>
            <Label>
                <Checkbox name="g" checked={this.state.gears} onClick={this.check.bind(this, 'gears')} readOnly/>
                Gears
            </Label>
        </Card>
        <Card>
            <Text textAlign="center" fontWeight="bold" f={2}>Special Rules</Text>
            <Label>
                <Checkbox name="4" checked={this.state.start_with_4_lives} onClick={this.check.bind(this, 'start_with_4_lives')} readOnly/>
                All robots start with 4 Lives
            </Label>
            <Label>
                <Checkbox name="2" checked={this.state.start_with_2_damage} onClick={this.check.bind(this, 'start_with_2_damage')} readOnly/>
                All robots start with 2 Damage
            </Label>
            <Label>
                <Checkbox name="1" checked={this.state.start_with_option} onClick={this.check.bind(this, 'start_with_option')} readOnly/>
                All robots start with one option
            </Label>
            <Label>
                <Checkbox name="3" checked={this.state.choose_1_of_3_options} onClick={this.check.bind(this, 'choose_1_of_3_options')} readOnly/>
                All robots choose from one of three options
            </Label>
            <Label>
                <Checkbox name="x" checked={this.state.no_power_down} onClick={this.check.bind(this, 'no_power_down')} readOnly/>
                Robots can't power down
            </Label>
            <Label>
                <Checkbox name="o" checked={this.state.option_for_heal} onClick={this.check.bind(this, 'option_for_heal')} readOnly/>
                Wrench/flag gives option card instead of repairing
            </Label>
        </Card>
        <Button bg="green" color="black" onClick={this.create}>Create Game</Button>
        <Button bg="red" color="black" onClick={this.props.back}>Nevermind</Button>
    </Content>
</Panel>
)}
}
