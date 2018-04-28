import { ButtonCircle } from 'rebass';

export default class Ready extends React.Component {
    ready(r) {
        ws.send({cmd: r ? 'ready' : 'not_ready'});
    }
    render() {
        const r = this.ready;
        const btn = 
        !this.props.ready ?
            <ButtonCircle bg="green" width={1} onClick={r.bind(this, true)}>
                {this.props.readyText ? this.props.readyText : 'Ready'}
            </ButtonCircle>
        : this.props.state === 'Waiting' ?
            <ButtonCircle bg="red" width={1} onClick={r.bind(this, false)}>Not Ready</ButtonCircle>
        :   <ButtonCircle bg="green" width={1}>Waiting...</ButtonCircle>;
        return btn;
    }
}
