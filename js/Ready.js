import Button from 'rebass/src/Button';

export default class Ready extends React.Component {
    ready(r) {
        this.props.ws.send({cmd: r ? 'ready' : 'not_ready'});
    }
    render() {
        const r = this.ready;
        const btn = 
        !this.props.ready ?
            <Button theme="success" onClick={r.bind(this, true)}>Ready</Button>
        : this.props.state === 'Waiting' ?
            <Button theme="error" onClick={r.bind(this, false)}>Not Ready</Button>
        :   <Button theme="success">Waiting...</Button>;
        return btn;
    }
}
