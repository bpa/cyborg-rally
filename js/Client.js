import Socket from "./Socket";
import Playing from "./Playing";
import Lobby from "./Lobby";

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
        return <View setView={this.setView} back={this.back}
                    ref={(e)=>this.view=e}/>
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
