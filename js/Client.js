import Socket from "./Socket";
import Playing from "./Playing";
import Lobby from "./Lobby";
import state from "./State";

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

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
    console.info(msg);
    var q = [this], i=0, ii=1;
    while (i < ii) {
        var o = q[i++];
        if (Array.isArray(o)) {
            ii += o.length;
            Array.prototype.push.apply(q, o);
        }
        else {
            deliver(msg, o);
        }
        if (o.view) {
            ii++;
            q.push(o.view);
        }
    }
}

class Client extends React.Component {
    constructor() {
        super();
        var ws = this.ws = new Socket(on_message.bind(this));
        window.onerror =  function(messageOrEvent, source, lineno, colno, error) {
            ws.send({cmd: 'error',
                message: error.message,
                stack: error.stack
            });
        }
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
          ButtonOutline: {
             margin: '.4em',
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
        const View = this.state.view;
        return <View ws={this.ws} setView={this.setView} back={this.back} ref={(e)=>this.view=e}/>
    }

    on_ready(msg) {
        state.public.player[msg.player].ready = true;
        state.me = state.public.player[state.id];
    }

    on_not_ready(msg) {
        state.public.player[msg.player].ready = false;
        state.me = state.public.player[state.id];
    }

    on_welcome(msg) {
        if ( window.localStorage.token !== undefined ) {
              this.ws.send({
                  cmd: 'login',
                  name: window.localStorage.name,
                  token: window.localStorage.token,
              });
        }
        else {
              this.ws.send({ cmd: 'login', name: window.localStorage.name });
        }
    }

    on_join(msg) {
        state.public.player[msg.id] = msg.player;
    }

    on_quit(msg) {
        delete state.public.player[msg.id];
    }

    on_login(msg) {
        window.localStorage.token = msg.token;
    }

    on_joined(msg) {
        state.id = msg.id;
        state.timediff = new Date().getTime() - msg.now;
        state.public = msg.public;
        state.private = msg.private;
        state.state = msg.state;
        state.me = msg.public.player[msg.id];
        if (msg.game === 'Rally') {
            this.setState({view: Playing});
        }
        else {
            this.setState({view: Lobby});
        }
    }
}

ReactDOM.render(<Client/>, document.getElementById('root'));
