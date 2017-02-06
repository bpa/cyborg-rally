import Button from 'rebass/src/Button';
import state from './State';

export default class Announcing extends React.Component {
    shutdown(activate) {
        this.props.ws.send({cmd: 'shutdown', activate: activate});
    }

    render() {
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

