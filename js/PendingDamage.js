import { Button, Card } from './Widgets';
import { Panel } from 'rebass';
import { Badge } from 'rebass';
import { Flex } from 'grid-styled';
import Icon from './Icon';
import Modal from './Modal';
import { Option } from './Option';

export default class PendingDamage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.damageRobot = this.damageRobot.bind(this);
    this.reset = this.reset.bind(this);
    this.discard = this.discard.bind(this);
  }

  select(option) {
    this.setState({selected: option});
  }

  damageRobot() {
    this.setState({selected: 'robot'});
  }

  discard() {
    ws.send({cmd: 'damage', target: this.state.selected});
    this.reset();
  }

  reset() {
    this.setState({selected: undefined});
  }

  choice(options, option) {
    let src = getFile(options[option]);
    return (
      <div key={option} onClick={this.select.bind(this, option)}
        style={{height: '48px', width: '48px',
          padding: '8px', margin: '8px 4px 0px 4px',
          border: '2px solid green', borderRadius: '8px',
        }}>
        <img src={src} style={{height: '100%'}}/>
      </div>
    );
  }

  render_discard() {
    let options = gs.public.player[gs.id].options;
    let keys = Object.keys(options || {});
    let available = keys.map(this.choice.bind(this, options));
    return (
<Modal title="Damage Pending" closeText="Have Robot Take Damage" close={this.damageRobot}>
  <Panel style={{minHeight:'vh'}}>
    <Panel.Header bg="orange" color="black">
      Discard Option
    </Panel.Header>
    <Flex>
      {available}
    </Flex>
  </Panel>
</Modal>);
  }

  render_robot() {
    return (
<Modal title="Damage Pending" close={this.reset} closeText="Nevermind">
  Are you sure you want to damage your robot?
  <Button onClick={this.discard}>Yes, damage my robot</Button>
</Modal>);
  }

  render_confirm() {
    return (
<Modal title="Damage Pending" close={this.reset} closeText="Nevermind">
  Are you sure you want to discard {this.state.selected}?
  <Button onClick={this.discard}>Yes, discard option</Button>
</Modal>);
  }

  render() {
    return this.props.pending === 0 ? null
      : this.state.selected === undefined ? this.render_discard()
      : this.state.selected === 'robot' ? this.render_robot()
      : this.render_confirm();
  }
}

