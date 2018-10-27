import ConfirmShot from './ConfirmShot';
import Deny from './Deny';
import Dispute from './Dispute';
import Player from './Player';
import Ready from './Ready';
import OptionPanel from './OptionPanel';
import FireControl from './FireControl';
import { Button, Content, Hr, Shutdown } from './Widgets';

export default class Firing extends React.Component {
    constructor(props) {
        super(props);
        var pending_shots = [];
        var disputed = [];
        var fire_control = null;
        if (gs.state) {
            for (var shot of gs.state.shots) {
                if (shot.dispute) {
                    if (shot.voted[gs.id] == undefined) {
                        disputed.push(shot);
                    }
                }
                else if (shot.target === gs.id) {
                    pending_shots.push({ player: shot.player, type: shot.type });
                }
            }
            if (this.props.players[gs.id].options['Fire Control']) {
                fire_control = gs.state['Fire Control'];
            }
        }
        this.state = {
            pending_shots: pending_shots,
            denied: [],
            disputed: disputed,
            active: 'laser',
            fire_control: fire_control,
        };
    }

    activate(o) {
        this.setState({ active: o });
    }

    deactivate(o) {
        this.setState({ active: 'laser' });
    }

    fire(p) {
        ws.send({ cmd: 'fire', type: this.state.active, target: p });
    }

    on_deny(msg) {
        if (Object.keys(this.props.players).length > 2) {
            var denied = this.state.denied;
            denied.push({ player: msg.player, type: msg.type });
            this.setState({ denied: denied })
        }
    }

    on_fire(msg) {
        var pending = this.state.pending_shots;
        pending.push(msg);
        this.setState({ pending_shots: pending })
    }

    on_fire_control(msg) {
        console.log(msg);
        this.setState({ fire_control: msg.target });
    }

    on_confirm(msg) {
        let pending = this.state.pending_shots;
        pending.remove((p) => p.player === msg.player);
        this.setState({ pending_shots: pending });
    }

    confirm(shot) {
        ws.send({ cmd: 'confirm', type: shot.type, player: shot.player });
        let pending = this.state.pending_shots;
        pending.remove((p) => p.player === shot.player);
        this.setState({ pending_shots: pending });
    }

    deny(shot) {
        ws.send({ cmd: 'deny', type: shot.type, player: shot.player });
        let pending = this.state.pending_shots;
        pending.remove((p) => p.player === shot.player);
        this.setState({ pending_shots: pending });
    }

    acceptDeny(d) {
        let denied = this.state.denied;
        denied.remove((deny) => deny.target === d.target);
        this.setState({ denied: denied });
    }

    escalate(d) {
        ws.send({ cmd: 'dispute', type: d.type, target: d.player });
        let denied = this.state.denied;
        denied.remove((deny) => deny.target === d.target);
        this.setState({ denied: denied });
    }

    on_dispute(d) {
        let disputed = this.state.disputed;
        disputed.push(d);
        this.setState({ disputed: disputed });
    }

    vote(d, v) {
        ws.send({
            cmd: 'vote',
            type: d.type,
            player: d.player,
            target: d.target,
            hit: v,
        });
        let disputed = this.state.disputed;
        disputed.remove((s) => s.target === d.target && s.player === d.player);
        this.setState({ disputed: disputed });
    }

    on_resolution(msg) {
        let disputed = this.state.disputed;
        disputed.remove((s) => s.target === msg.target && s.player === msg.player);
        this.setState({ disputed: disputed });
    }

    render() {
        var pending = this.state.pending_shots.map((s) => (
            <ConfirmShot player={this.props.me} shot={s} key={s.player}
                confirm={this.confirm.bind(this, s)}
                deny={this.deny.bind(this, s)} />
        ));

        var disputed = this.state.disputed.map((d) => (
            <Dispute shot={d} key={d.player} vote={this.vote.bind(this, d)} />
        ));

        if (this.props.me.shutdown) {
            return <Shutdown>{pending}{disputed}</Shutdown>;
        }

        console.log(this.state);
        return (
            <Content p={0}>
                <OptionPanel notify={this} active={this.state.active} min={2}>
                    <o name='laser' />
                    <o name='Rear-Firing Laser' />
                    <o name='High-Power Laser' />
                    <o name='Fire Control' />
                    <o name='Mini Howitzer' />
                    <o name='Pressor Beam' />
                    <o name='Radio Control' />
                    <o name='Scrambler' />
                    <o name='Tractor Beam' />
                </OptionPanel>
                <Ready ready={this.props.me.ready}
                    readyText="No one in line of sight" />
                <Hr />
                {this.players()}
                {this.state.denied.map((d) => (
                    <Deny type={d.type} target={d.player} key={d.player}
                        close={this.acceptDeny.bind(this, d)}
                        escalate={this.escalate.bind(this, d)} />))}
                {pending}
                {disputed}
                <FireControl target={this.state.fire_control} />
            </Content>
        )
    }

    sight() {
        return (
            <span>
                <svg viewBox="0 0 100 100" style={{ width: "0.75em" }}>
                    <g fill="currentColor" stroke="currentColor">
                        <use href="#sight" />
                    </g>
                </svg>
            </span>
        );
    }

    players() {
        var player = this.props.players;
        var self = this;
        const keys = Object.keys(player).sort().filter(
            (p) => p != gs.id && !player[p].dead
        );
        return keys.map(function (id) {
            const p = player[id];
            if (self.props.me.ready) {
                return <Player player={p} key={id} />
            } else {
                return (
                    <Button key={id} bg='black' color="red" onClick={self.fire.bind(self, id)}>
                        <div>{self.sight()} {p.name} {self.sight()}</div>
                    </Button>)
            }
        })
    }
}

