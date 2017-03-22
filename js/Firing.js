import Footer from 'rebass/src/Footer';
import Button from 'rebass/src/Button';
import Player from './Player';
import Ready from './Ready';
import { Shutdown } from './Emoji';

export default class Firing extends React.Component {
    constructor(props) {
        super(props);
        if (gs.state) {
            const keys = Object.keys(gs.state);
            keys.map(function(k) {
                var p = gs.state[k];
                if (p[0] && p[0].target === props.id) {
                    ws.send({
                        cmd: 'confirm',
                        player: k,
                        type: p[0].type,
                        confirmed: true
                    });
                }
            });
        }
    }

    fire(p) {
        ws.send({cmd: 'fire', type: 'laser', target: p});
    }

    on_fire(msg) {
        ws.send({
            cmd: 'confirm',
            player: msg.player,
            confirmed: true,
            type: msg.type
        });
    }

    render() {
        if (this.props.players[gs.id].shutdown) {
            return <Shutdown/>;
        }
    return (
<div>
    <Ready ready={this.props.me.ready}
        readyText="No one in line of sight"/>
    <hr/>
    {this.players()}
</div>
    )}

    players() {
        var player = this.props.players;
        var self = this;
        const keys = Object.keys(player).sort().filter(
            (p)=>p!=gs.id && !player[p].dead
        );
        return keys.map(function(id) {
            const p = player[id];
            if (self.props.me.ready) {
                return <Player player={p} key={id}/>
            } else { return (
            <Button key={id} theme='default' onClick={self.fire.bind(self, id)}>
                <font color="red">🞋 {p.name} 🞋</font>
            </Button> )
            }
        })
    }
}

