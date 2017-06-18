import Button from 'rebass/dist/Button';
import Modal from './Modal.js';

export default class Deny extends React.Component {
    render() {
        let name = gs.public.player[this.props.target].name;
        return (
<Modal title={name + " denies your shot"}
    closeText="Accept denial" close={this.props.close}>
    <Button onClick={this.props.escalate} theme="success">
        I totally shot {name}
    </Button>
</Modal>);
    }
}

