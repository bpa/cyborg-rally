import Button from 'rebass/dist/Button';
import ConfirmShot from './ConfirmShot';
import FireType from './FireType';
import Player from './Player';
import Ready from './Ready';
import { Shutdown } from './Emoji';

var weapons = [
    'Fire Control',
    'Mini Howitzer',
    'Pressor Beam',
    'Radio Control',
    'Rear-Firing Laser',
    'Scrambler',
    'Tractor Beam',
];

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
        this.fire_type = this.fire_type.bind(this);
        this.state = {};
    }

    fire(p) {
        for (var w of weapons) {
            if (this.props.me.options[w]) {
                this.setState({target: p})
                return;
            }
        }
        ws.send({cmd: 'fire', type: 'laser', target: p});
    }

    fire_type(w) {
        ws.send({cmd: 'fire', type: w, target: this.state.target});
        this.setState({target: null});
    }

    on_fire(msg) {
        this.setState({shot: msg})
    }

    confirmed() {
        ws.send({
            cmd: 'confirm',
            player: msg.player,
            confirmed: true,
            type: msg.type
        });
    }

    render() {
        if (this.props.me.shutdown) {
            return <Shutdown/>;
        }
    return (
<div>
    <Ready ready={this.props.me.ready}
        readyText="No one in line of sight"/>
    <hr/>
    {this.players()}
    <FireType player={this.props.me} weapons={weapons} target={this.state.target}
        onChoose={this.fire_type}/>
    <ConfirmShot player={this.props.me} shot={this.state.shot}/>
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

