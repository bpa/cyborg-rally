import Player from './Player';

export default class Players extends React.Component {
    render() {
        const players = this.props.players;
        return (
        <div>
            {Object.keys(players).sort().map((id) =>
                <Player {...this.props} player={players[id]} key={id}/>)}
        </div>
        );
    }
}
