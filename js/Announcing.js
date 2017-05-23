import Button from 'rebass/dist/Button';
import { Shutdown } from './Emoji';

export default class Announcing extends React.Component {
    shutdown(activate) {
        ws.send({cmd: 'shutdown', activate: activate});
    }

    render() {
        if (this.props.players[gs.id].shutdown) {
            return <Shutdown/>
        }
    return (
<div>
	<Button theme='success' onClick={this.shutdown.bind(this, false)}
      style={{width:"45%", paddingBottom:"45%", verticalAlign:"middle", borderRadius:6}}>
        Stay in
	</Button>
	<Button theme='error' onClick={this.shutdown.bind(this, true)}
      style={{width:"45%", paddingBottom:"45%", verticalAlign:"middle", borderRadius:6}}>
        Shutdown
	</Button>
</div>
    )}
}

