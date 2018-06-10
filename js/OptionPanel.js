import OptionCards from './OptionCards';
import OptionModal from './OptionModal';
import { Circle, Panel } from 'rebass';
import { Content } from './Widgets';
import { LASER_OPTION } from './Util';

export default class OptionPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHelp: false,
      openHelp: this.openHelp.bind(this),
    };
    this.closeHelp = this.closeHelp.bind(this);
  }

  openHelp(option) {
    this.setState({show: option, showHelp: false});
  }

  closeHelp() {
    this.setState({show: undefined});
  }

  toggleHelp() {
    let show = !this.state.showHelp;
    this.setState({showHelp: show});
  }

  render() {
    let held = [];
    let props = this.props;
    for (var o of props.children) {
      let element = OptionCards[o.props.name].render(props, this.state);
      if (element !== null) {
        held.push(element);
      }
    }

    if (held.length < (props.min || 1)) {
      return null;
    }

    let card = this.state.show === 'laser'
      ? LASER_OPTION
      : gs.public.player[gs.id].options[this.state.show];

    let modal = card !== undefined
      ? <OptionModal card={card} done={this.closeHelp}/>
      : null;

    return (
      <Panel mt={2}>
        <Panel.Header bg="green">
          Option Cards
          <span style={{position: 'absolute', right: ''}}>
            <Circle onClick={this.toggleHelp.bind(this)}>?</Circle>
          </span>
        </Panel.Header>
        <Content flexDirection="row" flexWrap="wrap">{held}</Content>
        {modal}
      </Panel>
    );
  }
}
