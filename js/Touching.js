import { Button, ButtonOutline } from 'rebass';

export default class Touching extends React.Component {
    constructor(props) {
        super(props);
        this.state = {tiles: gs.state || {}};
    }

    touch(tile) {
        ws.send({cmd:'touch', tile:tile});
    }

    on_touch(msg) {
        const tiles = this.state.tiles;
        tiles[msg.player] = msg.tile;
        this.setState({tiles: tiles});
    }

    button(label, key) {
        if (this.state.tiles[gs.id] === key) { return (
    <Button bg="blue" style={{width:'45%',paddingBottom:'30%',
            margin:'.4em',marginBottom:'.4em'}} key={key}>
        {label}
    </Button>
        )}
        else { return (
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        key={key} onClick={this.touch.bind(this, key)}>
        {label}
    </ButtonOutline>
        )}
    }
    render() {
        var buttons = [this.button('None', 'floor')];
        if (!this.props.me.shutdown) {
            buttons.push(this.button('Repair', 'repair'));
            buttons.push(this.button('Upgrade', 'upgrade'));
            buttons.push(this.button('Flag', 'flag'));
        }
        buttons.push(this.button('Fell in pit', 'pit'));
        buttons.push(this.button('Off the board', 'off'));

        return <div>{buttons}</div>;
   }
}
