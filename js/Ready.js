import { Button } from './Widgets';

export default class Ready extends React.Component {
    ready(r) {
        ws.send({cmd: r ? 'ready' : 'not_ready'});
    }
    render() {
        const r = this.ready;
        const btn = 
        !this.props.ready ?
            <Button onClick={r.bind(this, true)}
                style={{background: "radial-gradient(circle, orange 40%, red)"}}>
              {this.props.readyText ? this.props.readyText : 'Ready'}
            </Button>
        : this.props.state === 'Waiting' ?
            <Button bg="red" onClick={r.bind(this, false)}>Not Ready</Button>
        :   <Button bg="green">Waiting...</Button>;
        return btn;
    }
}
