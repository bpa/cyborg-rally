import ConfirmShot from './ConfirmShot';
import Deny from './Deny';
import Dispute from './Dispute';
import Player from './Player';
import Ready from './Ready';
import OptionPanel from './OptionPanel';
import FireControl from './FireControl';
import { Button, Content, Hr, Shutdown } from './Widgets';
import DamageHandler from './DamageHandler';

export default class Firing extends DamageHandler {
    constructor(props) {
        super(props);
        var fire_control = null;
        if (gs.state) {
            if (this.props.players[gs.id].options['Fire Control']) {
                fire_control = gs.state['Fire Control'];
            }
        }
        this.state.active = 'laser';
        this.state.fire_control = fire_control;
    }

    activate(o) {
        this.setState({ active: o });
    }

    deactivate(o) {
        this.setState({ active: 'laser' });
    }

    on_fire_control(msg) {
        console.log(msg);
        this.setState({ fire_control: msg.target });
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
                    <Button key={id} bg='black' color="red" onClick={self.fire.bind(self, self.state.active, id)}>
                        <div>{self.sight()} {p.name} {self.sight()}</div>
                    </Button>)
            }
        })
    }
}

