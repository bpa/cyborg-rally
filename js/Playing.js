import Button from 'rebass/src/Button';
import Waiting from "./Waiting";
import Programming from "./Programming";
import state from "./State";

var STATE = {
    Waiting: Waiting,
    Programming: Programming
};

export default class Playing extends React.Component {
    constructor(props) {
        super(props);
        var view = STATE[state.game.state];
        if (!view) {
            view = Waiting;
        }
        this.quit = this.quit.bind(this);
        this.state = { view: view };
    }

    on_state(msg) {
        state.game.state = msg.state;
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

