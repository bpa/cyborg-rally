import Ready from './Ready';
import Players from './Players';

export default class Waiting extends React.Component {
  render() {
    return (
<div>
	<Ready ready={this.props.me.ready}/>
  <hr style={{marginTop:"0", marginBottom:"12px"}}/>
  <Players players={this.props.players}/>
</div>
  )}
}
