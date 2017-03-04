import Player from './Player';

export default class Players extends React.Component {
    render() {
        console.log(this.props);
        const players = this.props.players;
        return (
        <div>
            {Object.keys(players).sort().map((id) =>
                <Player player={players[id]} key={id}/>)}
        </div>
        );
    }
}
