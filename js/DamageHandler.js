export default class DamageHandler extends React.Component {
    constructor(props) {
        super(props);
        var pending_shots = [];
        var disputed = [];
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
        }
        this.state = {
            pending_shots: pending_shots,
            denied: [],
            disputed: disputed,
        };
    }

    fire(type, p) {
        ws.send({ cmd: 'fire', type: type, target: p });
    }

    on_fire(msg) {
        var pending = this.state.pending_shots;
        pending.push(msg);
        this.setState({ pending_shots: pending })
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

    on_deny(msg) {
        if (Object.keys(this.props.players).length > 2) {
            var denied = this.state.denied;
            denied.push({ player: msg.player, type: msg.type });
            this.setState({ denied: denied })
        }
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
}
