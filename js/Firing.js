import { ButtonCircle } from './Widgets';
import ConfirmShot from './ConfirmShot';
import Deny from './Deny';
import Dispute from './Dispute';
import FireType from './FireType';
import Player from './Player';
import Ready from './Ready';
import { Shutdown } from './Widgets';

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
        var disputed = [];
        if (gs.state) {
            const keys = Object.keys(gs.state);
            keys.map(function(k) {
                var p = gs.state[k];
                for (var shot of p) {
                    if (shot.dispute) {
                        if (shot.voted[gs.id] == undefined) {
                            shot.player = k;
                            disputed.push(shot);
                        }
                    }
                    else if (shot.target === gs.id) {
                        pending_shots.push({player:k,type:shot.type});
                    }
                }
            });
        }
        this.fire_type = this.fire_type.bind(this);
        this.cancelFire = this.cancelFire.bind(this);
        this.state = {pending_shots: pending_shots, denied: [], disputed: disputed};
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

    on_deny(msg) {
        var denied = this.state.denied;
        denied.push({player: msg.player, type: msg.type});
        this.setState({denied: denied})
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
        pending.remove((p) => p.player === msg.player);
        this.setState({pending_shots: pending});
    }

    confirm(shot) {
        ws.send({cmd: 'confirm', type: shot.type, player: shot.player});
        let pending = this.state.pending_shots;
        pending.remove((p) => p.player === shot.player);
        this.setState({pending_shots: pending});
    }

    deny(shot) {
        ws.send({cmd: 'deny', type: shot.type, player: shot.player});
        let pending = this.state.pending_shots;
        pending.remove((p) => p.player === shot.player);
        this.setState({pending_shots: pending});
    }

    acceptDeny(d) {
        let denied = this.state.denied;
        denied.remove((deny) => deny.target === d.target);
        this.setState({denied: denied});
    }

    escalate(d) {
        ws.send({cmd: 'dispute', type: d.type, target: d.player});
        let denied = this.state.denied;
        denied.remove((deny) => deny.target === d.target);
        this.setState({denied: denied});
    }

    on_dispute(d) {
        let disputed = this.state.disputed;
        disputed.push(d);
        this.setState({disputed: disputed});
    }

    vote(d, v) {
        ws.send({cmd: 'vote', type: d.type, player: d.player, hit: v});
        let disputed = this.state.disputed;
        disputed.remove((s) => s.target === d.target && s.player === d.player);
        this.setState({disputed: disputed});
    }

    on_vote(msg) {
        let disputed = this.state.disputed;
        disputed.remove((s) => s.target === msg.target && s.player === msg.player);
        this.setState({disputed: disputed});
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
            confirm={this.confirm.bind(this, s)}
            deny={this.deny.bind(this, s)}/>))}
    {this.state.denied.map((d) => (
        <Deny type={d.type} target={d.player} key={d.player}
            close={this.acceptDeny.bind(this, d)}
            escalate={this.escalate.bind(this, d)}/>))}
    {this.state.disputed.map((d) => (
        <Dispute type={d.type} player={d.player} key={d.player} target={d.target}
            vote={this.vote.bind(this, d)}/>))}
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
            <ButtonCircle key={id} bg='black' color="red" onClick={self.fire.bind(self, id)}>
                🞋 {p.name} 🞋
            </ButtonCircle> )
            }
        })
    }
}

