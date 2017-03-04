import Button from 'rebass/src/Button';
import ButtonOutline from 'rebass/src/ButtonOutline';

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
    <Button theme="info" style={{width:'45%',paddingBottom:'30%',
            margin:'.4em',marginBottom:'.4em'}}>
        {label}
    </Button>
        )}
        else { return (
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, key)}>
        {label}
    </ButtonOutline>
        )}
    }
    render() { return (
        <div>
            {this.button('None', 'floor')}
            {this.button('Repair', 'repair')}
            {this.button('Upgrade', 'upgrade')}
            {this.button('Flag', 'flag')}
            {this.button('Fell in pit', 'pit')}
            {this.button('Off the board', 'off')}
        </div>
    )}
}
