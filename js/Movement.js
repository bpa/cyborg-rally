import ConfirmOption from './ConfirmOption';
import Modal from './Modal';
import OptionPanel from './OptionPanel';
import Ready from './Ready';
import Player from './Player';
import { Content, Hr, Shutdown } from './Widgets';

export default class Movement extends React.Component {
    constructor(props) {
      super(props);
      let state = gs.state || {};
      this.state = { order:state.order || [] };
      this.confirm = this.confirm.bind(this);
      this.cancel = this.cancel.bind(this);
    }
    
    activate(option) {
      if (option === 'Abort Switch') {
        this.setState({confirm: {
          name: option,
          message: <span>This register and all remaining registers will be replaced.</span>,
          action: () => ws.send({cmd: 'abort'}),
        }});
      }
    }

    deactivate(option) {
      this.setState({register: undefined, active: undefined, valid: ALL_CARDS});
    }

    confirm() {
      this.state.confirm.action();
      this.setState({confirm: undefined});
    }

    cancel() {
      this.setState({confirm: undefined});
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
<Content p={0}>
  <OptionPanel me={this.props.me} notify={this} active={this.state.active}>
    <o name='Abort Switch'/>
  </OptionPanel>
  <Ready ready={this.props.me.ready}/>
  <Hr/>
  {this.state.order.map((o) =>
    <Player player={players[o.player]} key={o.player} register={o}/>)}
  <ConfirmOption option={this.state.confirm}
    onConfirm={this.confirm} onCancel={this.cancel}/>
</Content>
    )}
}
