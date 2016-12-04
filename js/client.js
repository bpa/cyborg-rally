import Button from 'rebass/src/Button';
import Card from 'rebass/src/Card';
import Checkbox from 'rebass/src/Checkbox';
import Heading from 'rebass/src/Heading';
import Input from 'rebass/src/Input';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';
import Radio from 'rebass/src/Radio';

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

class Socket {
    constructor(on_message) {
        this.on_message = on_message;
        this.init();
    }

    init() {
        let loc = location;
        this.ws = new WebSocket('ws:'+loc.hostname+':'+loc.port+'/websocket');
        this.ws.onmessage = this.on_message;
        this.ws.onclose = () => setTimeout(this.init.bind(this), 1000);
    }

    close() {
        this.ws.onclose = undefined;
        this.ws.close();
    };

    send(msg) {
        console.log('<', msg);
        this.ws.send(JSON.stringify(msg));
    }
}

function deliver(msg, obj) {
    if (msg.cmd) {
        let o = obj, f;
        let f_name = 'on_' + msg.cmd;
        while (o) {
            f = o[f_name];
            if (typeof f === 'function') {
                f.call(obj, msg);
                return;
            }
            o = Object.getPrototypeOf(o);
        }
    }
}

function on_message(m) {
    let msg = JSON.parse(m.data);
    console.log('>', msg);
    deliver(msg, this);
    deliver(msg, this.view);
}

class Client extends React.Component {
    constructor() {
        super();
		this.ws = new Socket(on_message.bind(this));
        this.state = { view: () => <div>Initializing...</div> };
        this.setView = this.setView.bind(this);
        this.back = this.back.bind(this);
        this.stack = [Lobby];
    }

    static childContextTypes = {
		rebass: React.PropTypes.object
    }
  
    getChildContext () {
      return {
        rebass: {
          Button: {
             width: '100%',
             marginBottom: '1em',
          },
          borderRadius: 16,
          rounded: true,
        }
      }
    }

    setView(view) {
        this.stack.push(view);
        this.setState({view: view});
    }

    back() {
		this.stack.pop();
        this.setState({view: this.stack[this.stack.length-1]});
    }

    render() {
        return React.createElement(this.state.view, {
            ws: this.ws,
            setView: this.setView,
            back: this.back,
            ref: (e) => this.view = e
        });
    }

    on_welcome(msg) {
    	if ( window.sessionStorage.token !== undefined ) {
    	  	this.ws.send({
		  		cmd: 'login',
		  		name: window.localStorage.name,
		  		token: window.sessionStorage.token,
		  	});
    	}
    	else {
    	  	this.ws.send({ cmd: 'login', name: window.localStorage.name });
    	}
	}

    on_login(msg) {
		window.sessionStorage.token = msg.token;
    }

    on_joined(msg) {
        if (msg.game === 'Rally') {
            this.setState({view: Playing});
        }
        else {
            this.setState({view: Lobby});
        }
    }
}

class Lobby extends React.Component {
    constructor(props) {
        super(props);
        props.ws.send({cmd:'games'});
        this.state = {games:[]};
    }

    join(game) {
        this.props.ws.send({cmd: 'join', name: game.name});
    }

    game_button(g) {
        return <Button key={g.name} theme="primary"
            onClick={this.join.bind(this, g)}>
                 Join {g.name}
               </Button>
    }

    on_games(msg) {
        this.setState({games: msg.games.map(this.game_button.bind(this))});
    }

    on_create_game(msg) {
        let games = this.state.games;
        games.push(this.game_button(msg));
        this.setState({games: games});
    }

	render() { return (
<Panel theme="default">
    <PanelHeader>Lobby</PanelHeader>
    <Games games={this.state.games}/>
	<Button theme="success" onClick={this.props.setView.bind(null, CreateGame)}>
		Create Game
	</Button>
    <Button theme="warning" onClick={this.props.setView.bind(null, ChooseName)}>
        Name Preferences
    </Button>
</Panel>
	)}
}

class Games extends React.Component {
    render() {
        if (this.props.games) {
            return <div>{this.props.games}</div>;
        }
        return <div style={{width: "100%", textAlign: 'center'}}>
            <Heading theme="error">No games available</Heading>
            </div>
    }
}

class CreateGame extends React.Component {
	constructor(p) {
		super(p);
		this.timerOption = this.timerOption.bind(this);
		this.state = {
            timer: '1st+30s',
            conveyors: true,
            express_conveyors: true,
            pushers: false,
            gears: true,
            start_with_2_damage: false,
            choose_1_of_3_options: false,
            start_with_option: false,
            no_power_down: false,
            option_for_heal: false,
        };
        this.create = this.create.bind(this);
	}

	timerOption(e) {
		this.setState({timer: e.target.value});
	}

    check(field) {
        let state = {};
        state[field] = !this.state[field];
        this.setState(state);
    }

    create() {
        if (this.name.value) {
            let msg = Object.assign({cmd: 'create_game', name: this.name.value}, this.state);
            delete msg['error'];
            this.props.ws.send(msg);
        }
        else {
            this.setState({error: 'Name is required'});
            this.name.focus();
        }
    }

    on_create_game(msg) {
        console.log(msg, this.state);
        if (this.name.value === msg.name) {
            this.props.ws.send({cmd: 'join', name: msg.name});
        }
    }

    on_error(msg) {
        this.setState({error: msg.error});
    }

	render() { return (
<Panel theme="info">
	<PanelHeader>Create Game</PanelHeader>
	<Input label="Name" name="name" placeholder="Game Name" 
        message={this.state.error} baseRef={r=>this.name=r}/>
	<Card>
        <Heading>Timer options</Heading>
	<Radio name="timer" checked={this.state.timer==='standard'} onChange={this.timerOption} label="Standard (30 seconds after penultimate completion)" value='standard'/>
	<Radio name="timer" checked={this.state.timer==='1st+30s'} onChange={this.timerOption} label="Fast (30 seconds after first player finishes)" value='1st+30s'/>
	<Radio name="timer" checked={this.state.timer==='1m'} onChange={this.timerOption} label="Faster (1 minute)" value="1m"/>
	<Radio name="timer" checked={this.state.timer==='30s'} onChange={this.timerOption} label="Fastest (30 seconds)" value="30s"/>
    </Card>
	<Card>
        <Heading>Active Elements</Heading>
	    <Checkbox theme="success" name="c" label="Conveyor Belts" checked={this.state.conveyors} onClick={this.check.bind(this, 'conveyors')} readOnly/>
	    <Checkbox theme="success" name="e" label="Express Conveyor Belts" checked={this.state.express_conveyors} onClick={this.check.bind(this, 'express_conveyors')} readOnly/>
	    <Checkbox theme="success" name="p" label="Pushers" checked={this.state.pushers} onClick={this.check.bind(this, 'pushers')} readOnly/>
	    <Checkbox theme="success" name="g" label="Gears" checked={this.state.gears} onClick={this.check.bind(this, 'gears')} readOnly/>
    </Card>
	<Card>
        <Heading>Special Rules</Heading>
	    <Checkbox theme="success" name="2" label="All robots start with 2 Damage" checked={this.state.start_with_2_damage} onClick={this.check.bind(this, 'start_with_2_damage')} readOnly/>
	    <Checkbox theme="success" name="1" label="All robots start with one option" checked={this.state.start_with_option} onClick={this.check.bind(this, 'start_with_option')} readOnly/>
	    <Checkbox theme="success" name="3" label="All robots choose from one of three options" checked={this.state.choose_1_of_3_options} onClick={this.check.bind(this, 'choose_1_of_3_options')} readOnly/>
	    <Checkbox theme="success" name="x" label="Robots can't power down" checked={this.state.no_power_down} onClick={this.check.bind(this, 'no_power_down')} readOnly/>
	    <Checkbox theme="success" name="o" label="Wrench/flag gives option card instead of repairing" checked={this.state.option_for_heal} onClick={this.check.bind(this, 'option_for_heal')} readOnly/>
    </Card>
    <Button theme="primary" onClick={this.create}>Create Game</Button>
    <Button theme="error" onClick={this.props.back}>Nevermind</Button>
</Panel>
	)}
}

class ChooseName extends React.Component {
    onClick(e) {
        window.localStorage.name = this.name.value;
        this.props.ws.send({cmd:'set_name', name:this.name.value});
        this.props.back();
    }

    input(r) {
        if(r) {
            this.name = r;
            r.value=window.localStorage.name;
        }
    }

    render() { return (
<Panel theme="primary">
	<PanelHeader>Name Preferences</PanelHeader>
	<Input label="" name="name" placeholder="Name"
        baseRef={this.input.bind(this)}/>
	<Button theme="primary" onClick={this.onClick.bind(this)}>
		Save Preferences
	</Button>
	<Button theme="error" onClick={this.props.back}>
		Cancel
	</Button>
</Panel>
    )}
}

class Playing extends React.Component {
    constructor(props) {
        super(props);
        this.quit = this.quit.bind(this);
    }

    quit() {
        this.props.ws.send({cmd: 'quit'});
    }

    render() { return (
	<Button theme="error" onClick={this.quit}>
		Quit
	</Button>
    )}
}

ReactDOM.render(<Client/>, document.getElementById('root'));
