import { Column, Panel, Row } from 'rebass';
import { Button, Content, Hr, Registers } from "./Widgets";
import Announcing from "./Announcing";
import Firing from "./Firing"
import Lasers from "./Lasers";
import Movement from "./Movement";
import PendingDamage from "./PendingDamage";
import Programming from "./Programming";
import Timer from "./Timer";
import Touching from "./Touching";
import Vitality from "./Vitality";
import Waiting from "./Waiting";

var STATE = {
    Announcing: Announcing,
    Firing: Firing,
    Lasers: Lasers,
    Movement: Movement,
    PowerDown: Announcing,
    Programming: Programming,
    Touching: Touching,
};

export default class Playing extends React.Component {
    constructor(props) {
      super(props);
      var view = STATE[gs.public.state];
      if (!view) {
          view = Waiting;
      }
      this.quit = this.quit.bind(this);
      this.view = [];
      var pending = gs.state || {};
      pending = pending.pending_damage || {};
      pending = pending[gs.id] || 0;
      this.state = {
        view: view,
        players: gs.public.player,
        pending_damage: pending,
      };
    }

    on_state(msg) {
        gs.state = null;
        gs.public.state = msg.state;
        var players = gs.public.player;
        Object.keys(players).map((p) => players[p].ready = 0);
        var view = STATE[msg.state];
        if (!view) {
            view = Waiting;
        }
        if (msg.state === 'PowerDown') {
            Object.keys(players).map(function(p){
                delete players[p].shutdown;
                delete players[p].will_shutdown;
            });
        }
        if (msg.state === 'Programming') {
            gs.public.register = undefined;
        }
        else if (msg.state === 'Movement') {
            if (gs.public.register == undefined)
                gs.public.register = 0;
            else
                gs.public.register++;
        }
        this.setState({
            view:view,
            players:players,
        });
    }

    on_setup(msg) {
        gs.public = msg.public;
        this.setState({players:gs.public.player});
    }

    on_ready(msg) {
        gs.public.player[msg.player].ready = true;
        this.setState({players:gs.public.player});
    }

    on_not_ready(msg) {
        gs.public.player[msg.player].ready = false;
        this.setState({players:gs.public.player});
    }

    on_announce(msg) {
        gs.public.player[msg.player].will_shutdown = msg.shutdown;
        this.setState({players:gs.public.player});
    }

    on_shutdown(msg) {
        gs.public.player[msg.player].shutdown = msg.activate;
        this.setState({players:gs.public.player});
    }

    on_pending_damage(msg) {
        this.setState({pending_damage: msg.damage});
    }

    on_damage(msg) {
        gs.public.player[msg.player].damage = msg.damage;
        this.setState({players:gs.public.player});
    }

    on_death(msg) {
        gs.public.player[msg.player].dead = true;
        gs.public.player[msg.player].lives = msg.lives;
        this.setState({players:gs.public.player});
    }

    on_option(msg) {
        gs.public.player[msg.player].options[msg.option.name] = msg.option;
        this.setState({players:gs.public.player});
    }

    on_options(msg) {
        gs.public.player[msg.player].options = msg.options;
        this.setState({players:gs.public.player});
    }

    on_revive(msg) {
        gs.public.player[msg.player].dead = false;
        gs.public.player[msg.player].damage = msg.damage;
        this.setState({players:gs.public.player});
    }

    on_join(msg) {
        gs.public.player[msg.id] = msg.player;
        this.setState({players:gs.public.player});
    }

    on_quit(msg) {
        delete gs.public.player[msg.id];
        this.setState({players:gs.public.player});
    }

    quit() {
        ws.send({cmd: 'quit'});
    }

    render() {
        const State = gs.public.player[gs.id].dead ? Dead : this.state.view;
        var progress
            = gs.public.register !== undefined
            ? <Registers active={gs.public.register}/>
            : <span>&nbsp;</span>;

        return (
<Panel style={{minHeight:'vh'}}>
  <Panel.Header bg="blue" color="black" style={{
      textTransform:'captitalize',
      height:'3em',
      display:'flex',
      justifyContent:'space-between'}}>
    <div style={{top:'.5em', position:'relative', textAlign:'center'}}>
        <div>{gs.public.state.replace('_', ' ')}</div>
        {progress}
    </div>
    <Timer ref={(e)=>this.view[0] = e} timer={gs.public.timer}/>
    <Vitality player={gs.public.player[gs.id]}/>
  </Panel.Header>
  <Content>
    <State ref={(e)=>this.view[1] = e}
        me={gs.public.player[gs.id]} players={gs.public.player}/>
    <Hr/>
    <Button bg="red" onClick={this.quit}>
      Quit
    </Button>
  </Content>
  <PendingDamage pending={this.state.pending_damage}/>
</Panel>
)}
}

function Dead() {
  return <div style={{fontSize:120, textAlign:'center'}}>(x_x)</div>
}
