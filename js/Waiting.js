import Ready from './Ready';
import Players from './Players';
import { Content, Hr } from './Widgets';

export default class Waiting extends React.Component {
  render() {
    return (
<Content p={0}>
	<Ready ready={this.props.me.ready}/>
  <Hr/>
  <Players players={this.props.players}/>
</Content>
  )}
}
