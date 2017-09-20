import ChooseName from './ChooseName';
import CreateGame from './CreateGame';
import Games from './Games';

import { Box, ButtonCircle, Panel, PanelHeader } from './Widgets';

export default class Lobby extends React.Component {
    constructor(props) {
        super(props);
        ws.send({cmd:'games'});
        this.state = {games:[]};
    }

    join(game) {
        ws.send({cmd: 'join', name: game.name});
    }

    game_button(g) {
        return <ButtonCircle key={g.name} bg="blue"
            onClick={this.join.bind(this, g)}>
                 Join {g.name}
               </ButtonCircle>
    }

    on_games(msg) {
        this.setState({games: msg.games.map(this.game_button.bind(this))});
    }

    on_create_game(msg) {
        let games = this.state.games;
        games.push(this.game_button(msg));
        this.setState({games: games});
    }

    on_delete_game(msg) {
        let games = this.state.games.filter((g)=>g.key !== msg.name);
        this.setState({games: games});
    }

	render() { return (
<Panel color="black" style={{textAlign: 'center', bottom: '0'}}>
    <PanelHeader color="white" bg="black">Lobby</PanelHeader>
    <Box p={3}>
        <Games games={this.state.games}/>
        <ButtonCircle color="black" bg="green" onClick={this.props.setView.bind(null, CreateGame)}>
          Create Game
        </ButtonCircle>
        <ButtonCircle color="black" bg="red" onClick={this.props.setView.bind(null, ChooseName)}>
          Name Preferences
        </ButtonCircle>
    </Box>
</Panel>
	)}
}

