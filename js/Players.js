import Player from './Player';

export default class Players extends React.Component {
  render() {
    const players = this.props.players;
    const alive = Object.keys(players).filter((p)=>!players[p].dead);
    return (
    <div>
      {alive.sort().map((id) => <Player player={players[id]} key={id}/>)}
    </div>
    );
  }
}
