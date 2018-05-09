import Icon from './Icon';
import OptionCards from './OptionCards';
import { Panel } from 'rebass';
import { Content } from './Widgets';

function option(name, props) {
  if (props.active === name) {
    return <Icon name={name} key={name}
      onClick={props.notify.deactivate.bind(props.notify, name)}/>;
  }

  if (!(props.active === undefined && OptionCards[name].active())) {
    return <Icon name={name} key={name} inactive/>;
  }

  return <Icon name={name} key={name}
      onClick={props.notify.activate.bind(props.notify, name)}/>;
}

export default function OptionPanel(props) {
  let held = [];
  let opts = props.me.options;
  for (var o of props.children) {
    if (opts[o.props.name] !== undefined) {
      held.push(option(o.props.name, props));
    }
  }

  if (held.length === 0) {
    return null;
  }

  return (
    <Panel mt={2}>
      <Panel.Header bg="green">Option Cards</Panel.Header>
      <Content flexDirection="row" flexWrap="wrap">{held}</Content>
    </Panel>
  );
}
