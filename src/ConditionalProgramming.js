import { ws, GameContext } from './Util';
import React, { Component } from 'react';
import OptionModal from './OptionModal';
import { Badge, Panel } from './UI';
import { Tile, TileSet } from './TileSet';
import Player from './Player';

const cond_str = 'Conditional Program';

export default class ConditionalProgramming extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show_conditional: !!props.me.options[cond_str],
            player: Object.values(props.players).find(p => p.options[cond_str]),
        };
        this.closeHelp = this.closeHelp.bind(this);
    }

    reprogram(replace) {
        ws.send({ cmd: 'conditional_program', replace: replace });
    }

    openHelp(option) {
        this.setState({ help: GameContext.public.player[GameContext.id].options[option] });
    }

    closeHelp() {
        this.setState({ help: undefined });
    }

    render() {
        if (this.state.show_conditional) {
            return this.renderChoice();
        }
        return this.renderWaiting();
    }

    renderWaiting() {
        return <Player player={this.state.player} />
    }

    renderChoice() {
        let modal = this.state.help !== undefined
            ? <OptionModal card={this.state.help} done={this.closeHelp} />
            : null;

        return (
            <Panel color="accent-1" header={
                <div>
                    Conditional Program
                    <span style={{ position: 'absolute', right: '' }}>
                        <Badge onClick={this.openHelp.bind(this, cond_str)}>?</Badge>
                    </span>
                </div>
            }>
                <TileSet onClick={this.reprogram.bind(this)}>
                    <Tile id={true} bg="green">Replace movevent card</Tile>
                    <Tile id={false} bg="red">Leave it alone</Tile>
                </TileSet>
                {modal}
            </Panel>
        );
    }
}
