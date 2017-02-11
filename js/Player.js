import Button from 'rebass/src/Button';

export default class Player extends React.Component {
    render() {
        const p = this.props.player;
        return (
            <Button theme={p.ready?'success':'error'}>
                {p.name} - {p.ready?'Ready':'Not Ready'}
            </Button>
    )}
}
