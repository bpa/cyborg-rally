import Button from 'rebass/src/Button';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Announcing from "./Announcing";
import Lasers from "./Lasers";
import Movement from "./Movement";
import Programming from "./Programming";
import Touching from "./Touching";
import Waiting from "./Waiting";
import state from "./State";

var STATE = {
    Announcing: Announcing,
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
        this.state = { view: view, name: state.public.state };
    }

    on_state(msg) {
        state.public.state = msg.state;
        Object.keys(state.public.player).map((p) => state.public.player[p].ready = 0);
        var view = STATE[msg.state];
        if (!view) {
            view = Waiting;
        }
        this.setState({view:view, name:msg.state});
    }

    quit() {
        this.props.ws.send({cmd: 'quit'});
    }

    render() {
        const State = this.state.view;
        return (
<Panel theme="info">
  <PanelHeader style={{textTransform:'captitalize'}}>
    {this.state.name.replace('_', ' ')}
  </PanelHeader>
    <State {...this.props} ref={(e)=>this.view = e}/>
	<Button theme="error" onClick={this.quit} style={{position:'fixed',bottom:'0px',left:'0px'}}>
		Quit
	</Button>
</Panel>
    )}
}

