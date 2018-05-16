import { Button, ButtonOutline } from 'rebass';
import { Content } from './Widgets';
import { Tile, TileSet } from './TileSet';
import Watermark from './Watermark';

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

    render() {
      const hide = this.props.me.shutdown;
      return (
        <div>
          <TileSet onClick={this.touch.bind(this)}>
            <Tile id="floor">None</Tile>
            <Tile id='repair' hide={hide}>Repair</Tile>
            <Tile id='upgrade' hide={hide}>Upgrade</Tile>
            <Tile id='flag' hide={hide}>Flag</Tile>
            <Tile id='pit'>Fell in pit</Tile>
            <Tile id='off'>Off the board</Tile>
          </TileSet>
          <Watermark active={this.props.me.options['Mechanical Arm']}
            img='images/mechanical-arm.svg' text="Mechanical Arm"/>
        </div>
      );
   }
}
