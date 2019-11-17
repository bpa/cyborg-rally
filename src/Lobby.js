import { ws, useMessages } from './Util';
import React, { useState } from 'react';
import ChooseName from './ChooseName';
import CreateGame from './CreateGame';

import { Panel, Button } from './UI';
import { Box } from 'grommet';

function join(game) {
    ws.send({ cmd: 'join', name: game.name });
}

export default function Lobby(props) {
    let [games, setGames] = useState(() => {
        ws.send({ cmd: 'games' });
        return [];
    });
    console.log(games);

    useMessages({
        games: msg => setGames(msg.games),
        create_game: msg => setGames(g => g.concat(msg)),
        delete_game: msg => setGames(games => games.filter(g => g.name !== msg.name)),
    });

    function game_list() {
        if (games.length) {
            return games.map(g => (
                <Button key={g.name}
                    onClick={() => join(g)}>
                    Join {g.name}
                </Button>
            ));
        }
        return <div style={{ margin: 'auto' }}>No games available</div>;
    }

    return (
        <Panel background="neutral-1" title="Lobby">
            <Box p={0}>{game_list()}</Box>
            <Button color="status-ok" onClick={props.setView.bind(null, CreateGame)}>
                Create Game
                </Button>
            <Button background="accent-2" onClick={props.setView.bind(null, ChooseName)}>
                Name Preferences
                </Button>
        </Panel>
    );
}

