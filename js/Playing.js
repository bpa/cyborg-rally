import Button from 'rebass/src/Button';
import Announcing from "./Announcing";
import Movement from "./Movement";
import Programming from "./Programming";
import Touching from "./Touching";
import Waiting from "./Waiting";
import state from "./State";

var STATE = {
    Announcing: Announcing,
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
        this.state = { view: view };
    }

    on_state(msg) {
        state.public.state = msg.state;
        Object.keys(state.public.player).map((p) => state.public.player[p].ready = 0);
        var view = STATE[msg.state];
        if (!view) {
            view = Waiting;
        }
        this.setState({view:view});
    }

    quit() {
        this.props.ws.send({cmd: 'quit'});
    }

    render() {
        const State = this.state.view;
        return (
<div>
    <State {...this.props} ref={(e)=>this.view = e}/>
	<Button theme="error" onClick={this.quit} style={{position:'fixed',bottom:'0px',left:'0px'}}>
		Quit
	</Button>
</div>
    )}
}

