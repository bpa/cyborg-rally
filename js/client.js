import Switch from 'rebass/src/Switch';
import Button from 'rebass/src/Button';

var ws;

function connect() {
    ws = new WebSocket('ws://' + location.host + '/websocket/');
    ws.onmessage = on_message;
    ws.onclose = () => setTimeout(connect, 1000);
}

function on_message(m) {
	let msg = JSON.parse(m.data);
	console.log('>', msg);
};

function send(msg) {
    console.log('<', msg);
    ws.send(JSON.stringify(msg));
}

connect();
ReactDOM.render(<Button pill theme="secondary" onClick={()=>send({cmd: 'hello'})}>Hello</Button>, document.getElementById('root'));
