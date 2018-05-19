import Icon from './Icon';
import OptionCards from './OptionCards';
import { Circle, Panel } from 'rebass';
import { Content } from './Widgets';

export default class OptionPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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

    return (
      <Panel mt={2}>
        <Panel.Header bg="green">
          Option Cards
          <span style={{position: 'absolute', right: ''}}>
            <Circle onClick={this.toggleHelp.bind(this)}>?</Circle>
          </span>
        </Panel.Header>
        <Content flexDirection="row" flexWrap="wrap">{held}</Content>
      </Panel>
    );
  }
}
