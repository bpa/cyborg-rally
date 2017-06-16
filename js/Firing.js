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
        var pending_shots = [];
        var pending_votes = [];
        if (gs.state) {
            const keys = Object.keys(gs.state);
            keys.map(function(k) {
                var p = gs.state[k];
                for (var i=0; i<2; i++) {
                    if (p[i] && p[i].target === gs.id) {
                        pending_shots.push({player:k,type:p[i].type});
                    }
                }
            });
        }
        this.fire_type = this.fire_type.bind(this);
        this.cancelFire = this.cancelFire.bind(this);
        this.state = {pending_shots: pending_shots};
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

    cancelFire() {
        this.setState({target: null});
    }

    fire_type(w) {
        ws.send({cmd: 'fire', type: w, target: this.state.target});
        this.setState({target: null});
    }

    on_fire(msg) {
        var pending = this.state.pending_shots;
        pending.push(msg);
        this.setState({pending_shots: pending})
    }

    on_confirm(msg) {
        let pending = this.state.pending_shots;
        let i = pending.findIndex((p) => p.player === msg.player);
        if (i > -1) {
            pending.splice(i, 1);
        }
        this.setState({pending_shots: pending});
    }

    deny(shot) {
        ws.send({cmd: 'deny', type: shot.type, player: shot.player});
        let pending = this.state.pending_shots;
        let i = pending.findIndex((p) => p.player === shot.player);
        if (i > -1) {
            pending.splice(i, 1);
        }
        this.setState({pending_shots: pending});
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
        onChoose={this.fire_type} close={this.cancelFire}/>
    {this.state.pending_shots.map((s) => (
        <ConfirmShot player={this.props.me} shot={s} key={s.player}
            deny={this.deny.bind(this, s)}/>))}
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

