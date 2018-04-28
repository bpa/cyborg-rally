import { Button } from './Widgets';

export default class Ready extends React.Component {
    ready(r) {
        ws.send({cmd: r ? 'ready' : 'not_ready'});
    }
    render() {
        const r = this.ready;
        const btn = 
        !this.props.ready ?
            <Button bg="green" onClick={r.bind(this, true)}>
                {this.props.readyText ? this.props.readyText : 'Ready'}
            </Button>
        : this.props.state === 'Waiting' ?
            <Button bg="red" onClick={r.bind(this, false)}>Not Ready</Button>
        :   <Button bg="green">Waiting...</Button>;
        return btn;
    }
}
