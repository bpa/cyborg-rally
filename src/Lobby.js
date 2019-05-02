import { ws } from './Util';
import React from 'react';
import ChooseName from './ChooseName';
import CreateGame from './CreateGame';
import Games from './Games';
import RegisteredComponent from './RegisteredComponent';

import { Panel, Button } from './UI';

export default class Lobby extends RegisteredComponent {
    constructor(props) {
        super(props);
        ws.send({ cmd: 'games' });
        this.state = { games: [] };
    }

    join(game) {
        ws.send({ cmd: 'join', name: game.name });
    }

    game_button(g) {
        return <Button key={g.name} bg="blue"
            onClick={this.join.bind(this, g)}>
            Join {g.name}
        </Button>
    }

    on_games(msg) {
        this.setState({ games: msg.games.map(this.game_button.bind(this)) });
    }

    on_create_game(msg) {
        let games = this.state.games;
        games.push(this.game_button(msg));
        this.setState({ games: games });
    }

    on_delete_game(msg) {
        let games = this.state.games.filter((g) => g.key !== msg.name);
        this.setState({ games: games });
    }

    render() {
        return (
            <Panel background="neutral-1" title="Lobby">
                <Games games={this.state.games} />
                <Button color="status-ok" onClick={this.props.setView.bind(null, CreateGame)}>
                    Create Game
                </Button>
                <Button color="accent-2" onClick={this.props.setView.bind(null, ChooseName)}>
                    Name Preferences
                </Button>
            </Panel>
        )
    }
}

