import Button from 'rebass/src/Button';
import DotIndicator from 'rebass/src/DotIndicator';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Announcing from "./Announcing";
import Firing from "./Firing";
import Lasers from "./Lasers";
import Movement from "./Movement";
import Programming from "./Programming";
import Touching from "./Touching";
import Waiting from "./Waiting";
import state from "./State";

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
        var view = STATE[state.public.state];
        if (!view) {
            view = Waiting;
        }
        this.quit = this.quit.bind(this);
        this.state = {
            view: view,
            name: state.public.state,
            register:state.public.register
        };
    }

    on_state(msg) {
        state.public.state = msg.state;
        Object.keys(state.public.player).map((p) => state.public.player[p].ready = 0);
        var view = STATE[msg.state];
        if (!view) {
            view = Waiting;
        }
        if (msg.state === 'Programming') {
            state.public.register = undefined;
        }
        else if (msg.state === 'Movement') {
            if (state.public.register == undefined)
                state.public.register = 0;
            else
                state.public.register++;
        }
        this.setState({
            view:view,
            name:msg.state,
            register:state.public.register
        });
    }

    quit() {
        this.props.ws.send({cmd: 'quit'});
    }

    options() {
        return <div/>
    }

    register() {
        if (this.state.register !== undefined) {
            return (
            <div style={{right:24, top:16, position:'absolute', textAlign:'center'}}>
                Register<br/>
                <DotIndicator active={this.state.register} style={{position:'relative', top:-4}} length={5}/>
            </div>);
        }
        return <span/>
    }

    render() {
        const State = this.state.view;
        return (
<Panel theme="info">
  <PanelHeader style={{textTransform:'captitalize'}}>
    {this.state.name.replace('_', ' ')} {this.register()}
  </PanelHeader>
    <State {...this.props} ref={(e)=>this.view = e}/>
    {options()}
	<Button theme="error" onClick={this.quit} style={{position:'fixed',bottom:'0px',left:'0px'}}>
		Quit
	</Button>
</Panel>
    )}
}

