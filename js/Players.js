import Player from './Player';

export default function Players(props) {
  const players = props.players;
  const alive = Object.keys(players).filter((p)=>!players[p].dead);
  return (
  <div>
    {alive.sort().map((id) => <Player {...props} player={players[id]} key={id}/>)}
  </div>
  );
}
