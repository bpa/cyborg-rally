import Button from 'rebass/dist/Button';
import Modal from './Modal.js';

export default class Dispute extends React.Component {
    render() {
        let p_name = gs.public.player[this.props.player].name;
        let t_name = gs.public.player[this.props.target].name;
        return (
<Modal title={"Did " + p_name + " shoot " + t_name + "?"}
    closeText="No" close={this.props.vote.bind(null, false)}>
    <Button onClick={this.props.vote.bind(null,true)} theme="success">
        Yes
    </Button>
</Modal>);
    }
}

