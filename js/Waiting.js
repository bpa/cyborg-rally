import Button from 'rebass/src/Button';
import Players from './Players';
import Ready from './Ready';

export default class Waiting extends React.Component {
    render() {
    return (
<div>
	<Ready ready={this.props.me.ready}/>
    <hr/>
    <Players players={this.props.players}/>
</div>
    )}
}

