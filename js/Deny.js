import { Button } from 'rebass';
import Modal from './Modal.js';

export default class Deny extends React.Component {
    render() {
        let name = gs.public.player[this.props.target].name;
        return (
<Modal title={name + " denies your shot"}
    closeText="Accept denial" close={this.props.close}>
    <Button onClick={this.props.escalate} bg="green">
        I totally shot {name}
    </Button>
</Modal>);
    }
}

