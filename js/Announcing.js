import { Button } from 'rebass';
import { Shutdown } from './Widgets';

export default class Announcing extends React.Component {
    shutdown(activate) {
        ws.send({cmd: 'shutdown', activate: activate});
    }

    render() {
        if (this.props.players[gs.id].shutdown) {
            return <Shutdown/>
        }
    return (
<div style={{display:'flex', marginBottom:'12px'}}>
	<Button bg='green' px={0} py={0} onClick={this.shutdown.bind(this, false)}
      style={{flex:"1 100px", borderRadius:6}}>
        <div style={{padding:'45% 0px'}}>Stay in</div>
	</Button>
	<Button bg='red' onClick={this.shutdown.bind(this, true)}
      style={{flex:"1 100px", borderRadius:6}}>
        Shutdown
	</Button>
</div>
    )}
}

