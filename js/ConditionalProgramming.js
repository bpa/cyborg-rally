import OptionModal from './OptionModal';
import { Content } from './Widgets';
import { Circle, Panel } from 'rebass';
import { Tile, TileSet } from './TileSet';
import Player from './Player';

const cond_str = 'Conditional Program';

export default class ConditionalProgramming extends React.Component {
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
        this.setState({ help: gs.public.player[gs.id].options[option] });
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
            <Content p={0}>
                <Panel mt={2}>
                    <Panel.Header bg="green">
                        Conditional Program
            <span style={{ position: 'absolute', right: '' }}>
                            <Circle onClick={this.openHelp.bind(this, cond_str)}>?</Circle>
                        </span>
                    </Panel.Header>
                    <TileSet onClick={this.reprogram.bind(this)}>
                        <Tile id={true} bg="green">Replace movevent card</Tile>
                        <Tile id={false} bg="red">Leave it alone</Tile>
                    </TileSet>
                </Panel>
                {modal}
            </Content>
        );
    }
}
