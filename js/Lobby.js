import ChooseName from './ChooseName';
import CreateGame from './CreateGame';
import Games from './Games';

import Button from 'rebass/src/Button';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';

export default class Lobby extends React.Component {
    constructor(props) {
        super(props);
        props.ws.send({cmd:'games'});
        this.state = {games:[]};
    }

    join(game) {
        this.props.ws.send({cmd: 'join', name: game.name});
    }

    game_button(g) {
        return <Button key={g.name} theme="primary"
            onClick={this.join.bind(this, g)}>
                 Join {g.name}
               </Button>
    }

    on_games(msg) {
        this.setState({games: msg.games.map(this.game_button.bind(this))});
    }

    on_create_game(msg) {
        let games = this.state.games;
        games.push(this.game_button(msg));
        this.setState({games: games});
    }

	render() { return (
<Panel theme="default">
    <PanelHeader>Lobby</PanelHeader>
    <Games games={this.state.games}/>
	<Button theme="success" onClick={this.props.setView.bind(null, CreateGame)}>
		Create Game
	</Button>
    <Button theme="warning" onClick={this.props.setView.bind(null, ChooseName)}>
        Name Preferences
    </Button>
</Panel>
	)}
}

