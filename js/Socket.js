export default class Socket {
    constructor(on_message) {
        this.on_message = on_message;
        this.init();
    }

    init() {
        this.ws = new WebSocket('ws://'+location.host+'/websocket');
        this.ws.onmessage = this.on_message;
        this.ws.onclose = () => setTimeout(this.init.bind(this), 1000);
    }

    close() {
        this.ws.onclose = undefined;
        this.ws.close();
    };

    send(msg) {
        console.log(msg);
        this.ws.send(JSON.stringify(msg));
    }
}
