import { Shutdown } from './Widgets';
import { Tile, TileSet} from './TileSet';

export default class Configuring extends React.Component {
  stabilize(activate) {
    ws.send({cmd: 'stabilizer', activate: activate});
  }

  render() {
    if (this.props.players[gs.id].shutdown) {
      return <Shutdown/>
    }
    return (
      <TileSet onClick={this.stabilize.bind(this)}>
        <Tile id={true} bg="green">Activate Gyroscopic Stabilizer</Tile>
        <Tile id={false} bg="red">Allow board to rotate me</Tile>
      </TileSet>
    );
  }
}

