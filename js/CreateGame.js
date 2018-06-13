import { Button as rBtn, ButtonOutline, Checkbox, Input, Label, Lead, Panel, Radio, Text } from 'rebass';
import { Flex } from 'grid-styled';
import { Button, Card, Content } from './Widgets';

function Section(props) {
  return (
    <Panel mt={2}>
      <Panel.Header bg="green">{props.name}</Panel.Header>
      <Content>
        {props.children}
      </Content>
    </Panel>
  );
}

export default class CreateGame extends React.Component {
	constructor(p) {
		super(p);
		this.state = {
      timer: '1st+30s',
      conveyors: true,
      board_lasers: false,
      express_conveyors: false,
      pushers: false,
      gears: false,
      lives: '3',
      options: '0',
      start_with_2_damage: false,
      no_power_down: false,
      option_for_heal: false,
    };
    this.create = this.create.bind(this);
	}

	set(key, value) {
    let s = {};
    s[key] = value;
    this.setState(s);
	}

  check(props) {
    let checked = this.state[props.id];
    let Btn = checked ? rBtn : ButtonOutline;
    return (
      <Btn style={{textAlign: 'left'}}
          onClick={this.set.bind(this, props.id, !checked)}>
        <Checkbox checked={checked} readOnly/>
        {props.children}
      </Btn>
    );
  }

  itemGroup(props) {
    let style = { flexGrow: 1 };
    let active = this.state[props.name];
    let self = this;

    return (
      <Flex flexWrap="wrap">{
        props.children.map(function(p) {
          let Btn = p.props.id === active ? rBtn : ButtonOutline;
          return (
            <Btn style={style} key={p.props.id}
                onClick={self.set.bind(self, props.name, p.props.id)}>
              {p.props.children}
            </Btn>
          );
        })
      } </Flex>
    );
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

	render() {
    let Check = this.check.bind(this);
    let ItemGroup = this.itemGroup.bind(this);
    return (
<Panel>
	<Panel.Header bg="green">Create Game</Panel.Header>
  <Content>
    <Input autoFocus label="Name" id="name" placeholder="Game Name" 
        onChange={(r)=>this.name=r.target.value}/>
    <Text textAlign="center" fontWeight="bold" color="red">{this.state.error}</Text>
    <Section name="Timer options">
      <ItemGroup name="timer">
        <i id="standard">Standard (30 seconds after penultimate completion)</i>
        <i id="1st+30s">Fast (30 seconds after first player finishes)</i>
        <i id="1m">Faster (1 minute)</i>
        <i id="30s">Fastest (30 seconds)</i>
      </ItemGroup>
    </Section>
    <Section name="Active Elements">
      <Check id="board_lasers">Board Lasers</Check>
      <Check id="conveyors">Conveyor Belts</Check>
      <Check id="express_conveyors">Express Conveyor Belts</Check>
      <Check id="pushers">Pushers</Check>
      <Check id="gears">Gears</Check>
    </Section>
    <Section name="Lives">
      <ItemGroup name="lives">
        <i id="3">3</i>
        <i id="4">4</i>
        <i id="Inf">Infinite</i>
      </ItemGroup>
    </Section>
    <Section name="Options">
      <ItemGroup name="options">
        <i id="0">0</i>
        <i id="1">1</i>
        <i id="1of3">Deal 3, choose 1</i>
      </ItemGroup>
    </Section>
    <Section name="Special Rules">
      <Check id="start_with_2_damage">All robots start with 2 Damage</Check>
      <Check id="no_power_down">Robots can't power down</Check>
      <Check id="option_for_heal">Wrench/flag gives option card instead of repairing</Check>
    </Section>
    <Button bg="green" color="black" onClick={this.create}>Create Game</Button>
    <Button bg="red" color="black" onClick={this.props.back}>Nevermind</Button>
  </Content>
</Panel>
)}
}
