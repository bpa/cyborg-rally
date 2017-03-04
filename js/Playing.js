import Button from 'rebass/src/Button';
import DotIndicator from 'rebass/src/DotIndicator';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Announcing from "./Announcing";
import Firing from "./Firing";
import Lasers from "./Lasers";
import Movement from "./Movement";
import Programming from "./Programming";
import Timer from "./Timer";
import Touching from "./Touching";
import Waiting from "./Waiting";

var STATE = {
    Announcing: Announcing,
    Firing: Firing,
    Lasers: Lasers,
    Movement: Movement,
    Programming: Programming,
    Touching: Touching,
    Waiting: Waiting,
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
        this.state = {
            view: view,
            players: gs.public.player,
        };
    }

    on_state(msg) {
        gs.state = null;
        gs.public.state = msg.state;
        Object.keys(gs.public.player).map((p) => gs.public.player[p].ready = 0);
        var view = STATE[msg.state];
        if (!view) {
            view = Waiting;
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
        this.setState({view:view});
    }

    on_ready(msg) {
        gs.public.player[msg.player].ready = true;
        this.setState({players:gs.public.player});
    }

    on_not_ready(msg) {
        gs.public.player[msg.player].ready = false;
        this.setState({players:gs.public.player});
    }

    on_join(msg) {
        gs.public.player[msg.id] = msg.player;
    }

    on_quit(msg) {
        delete gs.public.player[msg.id];
    }

    quit() {
        ws.send({cmd: 'quit'});
    }

    health() {
        //const reg = this.state.memory
        //var up = Array(5).keys().map((i)=>i
        //for (var i=0; i<5; i++)
        //♡♥
    }

    lives() {
    //●○
    }

    render() {
        const State = this.state.view;
        var progress
            = gs.public.register !== undefined
            ? <DotIndicator active={gs.public.register}
                style={{position:'relative', top:-4}} length={5}/>
            : <span>&nbsp;</span>;

        return (
<Panel theme="info">
  <PanelHeader style={{textTransform:'captitalize', height:'3em'}}>
    <div style={{top:'.5em', position:'relative', textAlign:'center'}}>
        <div>{gs.public.state.replace('_', ' ')}</div>
        {progress}
    </div>
    <Timer ref={(e)=>this.view[0] = e} timer={gs.public.timer}/>
    {this.health()}
    {this.lives()}
  </PanelHeader>
    <State ref={(e)=>this.view[1] = e}
        me={gs.public.player[gs.id]} players={gs.public.player}/>
	<Button theme="error" onClick={this.quit} style={{position:'fixed',bottom:'0px',left:'0px'}}>
		Quit
	</Button>
</Panel>
    )}
}

