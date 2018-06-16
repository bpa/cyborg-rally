import { Provider } from 'rebass'
import Socket from "./Socket";
import Playing from "./Playing";
import Lobby from "./Lobby";
import theme from "./theme";

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

if (!Array.prototype.clone){
    Array.prototype.clone = function(){
        return JSON.parse(JSON.stringify(this));
    };
};

if (!Array.prototype.remove){
    Array.prototype.remove = function(cb){
        var i = this.findIndex(cb);
        if (i > -1) {
            this.splice(i, 1);
        }
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
        if (o && o.view) {
            ii++;
            q.push(o.view);
        }
    }
}

class Client extends React.Component {
    constructor() {
        super();
        ws = new Socket(on_message.bind(this));
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
        return (
      <Provider theme={theme}>
        <View setView={this.setView} back={this.back} ref={(e)=>this.view=e}/>
      </Provider>);
    }

    on_welcome(msg) {
        if ( window.localStorage.token !== undefined ) {
              ws.send({
                  cmd: 'login',
                  name: window.localStorage.name,
                  token: window.localStorage.token,
              });
        }
        else {
              ws.send({ cmd: 'login', name: window.localStorage.name });
        }
    }

    on_login(msg) {
        window.localStorage.token = msg.token;
    }

    on_joined(msg) {
        delete msg.cmd;
        msg.timediff = new Date().getTime() - msg.now;
        gs = msg;
        this.setState({view: msg.game === 'Rally' ? Playing : Lobby});
    }
}

ReactDOM.render(<Client/>, document.getElementById('root'));
