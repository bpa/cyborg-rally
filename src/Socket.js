let subscriptions = new Map();

export default class Socket {
    constructor() {
        this.on_message = this.on_message.bind(this);
    }

    init() {
        this.ws = new WebSocket('ws://192.168.2.9:3000/websocket');
        // this.ws = new WebSocket('ws://127.0.0.1:3000/websocket');
        // this.ws = new WebSocket('ws://' + window.location.host + '/websocket');
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

    on_message(m) {
        let msg = JSON.parse(m.data);
        console.info(msg);
        let callbacks = subscriptions.get(msg.cmd);
        if (callbacks) {
            callbacks.forEach((f) => f(msg));
        }
    }

    subscribe(instance, name, callback) {
        let methods = subscriptions.get(name);
        if (!methods) {
            methods = new Map();
            subscriptions.set(name, methods);
        }

        methods.set(instance, callback);
    }

    unsubscribe(instance, name) {
        subscriptions.get(name).delete(instance);
    }
}
