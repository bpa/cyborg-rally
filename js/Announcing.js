import { Shutdown } from './Widgets';
import { Tile, TileSet} from './TileSet';

export default class Announcing extends React.Component {
  shutdown(activate) {
    ws.send({cmd: 'shutdown', activate: activate});
  }

  render() {
    if (this.props.players[gs.id].shutdown) {
      return <Shutdown/>
    }
    return (
      <TileSet onClick={this.shutdown.bind(this)}>
        <Tile id={false} bg="green">Stay in</Tile>
        <Tile id={true} bg="red">Shutdown</Tile>
      </TileSet>
    );
  }
}

